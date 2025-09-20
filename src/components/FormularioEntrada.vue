<template>
  <v-form ref="form">
    <v-text-field
      label="Id do chamado"
      v-model="idChamado"
      :rules="[mandatoryFieldRule]"
    />
    <v-text-field
      label="Numero de terminais"
      v-model="numTerminais"
      type="number"
      :rules="[mandatoryFieldRule, terminalsRule]"
    />
    <v-radio-group v-model="servicoCartaoRef" :rules="[mandatoryFieldRule]">
      <v-radio
        v-for="servico in servicosCartao"
        :key="servico"
        :label="servico"
        :value="servico"
      />
    </v-radio-group>

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
const servicoCartaoRef = ref('SC2');
const isLoading = ref(false);
const form = ref(null);
const servicosCartao = [
  'SC2',
  'SC3',
  'SC4',
  'SCS_VERO',
  'SCS_SICREDI',
  'SCS_CIELO',
];

const mandatoryFieldRule = (value) =>
  isEmpty(value) ? 'Campo obrigatório' : true;

const terminalsRule = (value) => {
  value = Number(value);
  return value < 1 ? 'O numero de terminais deve ser maior que zero' : true;
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
    const { valid } = await form.value.validate();
    if (!valid) return;

    isLoading.value = true;

    const payload = {
      id: idChamado.value,
      terminais: parseInt(numTerminais.value),
      servico_cartao: servicoCartaoRef.value,
    };

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
