<template>
  <v-form>
    <v-text-field label="Id do chamado" v-model="idChamado" />

    <v-text-field
      label="Numero de terminais"
      v-model="numTerminais"
      type="number"
    />

    <v-select
      :items="servicosCartao"
      v-model="servicoCartaoRef"
      label="Serviço de Cartão"
    />

    <v-btn
      @click="geraFicha"
      color="primary"
      text="Gerar ficha"
      :loading="isLoading"
      :disabled="isLoading"
    />
  </v-form>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { isEmpty } from 'vuetify/lib/util/helpers.mjs';

const apiURL = 'http://127.0.0.1:8000/fichas';
const idChamado = ref('');
const numTerminais = ref(1);
const servicoCartaoRef = ref(null);
const isLoading = ref(false);
const servicosCartao = [
  'SC2',
  'SC3',
  'SC4',
  'SCS_VERO',
  'SCS_SICREDI',
  'SCS_CIELO',
];

const returnPayload = (idChamado, numTerminais, servicoCartaoRef) => {
  if (
    isEmpty(idChamado) ||
    isEmpty(numTerminais) ||
    isEmpty(servicoCartaoRef)
  ) {
    throw new Error('Há campos vazios.');
  } else {
    numTerminais = parseInt(numTerminais);
    if (isNaN(numTerminais)) {
      throw new Error('O numero de terminais deve ser um numero inteiro.');
    }
    if (numTerminais < 1) {
      throw new Error('O numero de terminais deve ser maior que 0.');
    }

    const payload = {
      id: idChamado,
      terminais: numTerminais,
      servico_cartao: servicoCartaoRef,
    };

    return payload;
  }
};

const returnFileName = (response) => {
  //attachment; filename=nome_da_ficha.xlsx
  const contentDisposition = response.headers['content-disposition'];
  if (!contentDisposition)
    throw new Error('header content-disposition não encontrado.');

  const partes = contentDisposition.split('filename=');
  if (partes.length < 2) throw new Error('filename nao encontrado.');
  return partes[1];
};

const downloadFile = (response) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  if (!url) throw new Error('url nao encontrada');
  const link = document.createElement('a');
  link.href = url;
  const fileName = returnFileName(response);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const geraFicha = async () => {
  try {
    isLoading.value = true;

    const payload = returnPayload(
      idChamado.value,
      numTerminais.value,
      servicoCartaoRef.value
    );

    const response = await axios.post(apiURL, payload, {
      responseType: 'blob',
    });

    downloadFile(response);
  } catch (error) {
    if (error.response) {
      if (
        error.response.data instanceof Blob &&
        error.response.data.type === 'application/json'
      ) {
        (async () => {
          try {
            const errorText = await error.response.data.text();
            const errorJson = JSON.parse(errorText);

            console.error('Erro API:', errorJson.detail);
            alert(`Erro: ${errorJson.detail}`);
          } catch (parseError) {
            console.error('Falha ao ler a resposta de erro da API', parseError);
            alert('Ocorreu um erro inesperado no servidor.');
          }
        })();
      } else {
        console.error('Erro API:', error.response.data);
        alert('Ocorreu um erro na resposta do servidor.');
      }
    } else if (error.request) {
      console.log(error.request);
      alert(error.request);
    } else {
      console.log(error.message);
      alert(error.message);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
