<template>
  <v-container>
    <v-form ref="form" class="mx-auto w-75">
      <v-row>
        <v-col>
          <v-text-field
            variant="outlined"
            label="Id do chamado"
            v-model="idChamado"
            :rules="[mandatoryFieldRule]"
            rounded
            bg-color="grey-lighten-5"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-text-field
            variant="outlined"
            bg-color="grey-lighten-5"
            label="Numero de terminais"
            v-model="numTerminais"
            type="number"
            rounded
            :rules="[mandatoryFieldRule, terminalsRule]"
          />
        </v-col>
        <v-col cols="6">
          <v-label for="servicoCartao">Serviço de cartão</v-label>
          <v-radio-group v-model="servicoCartaoRef" :rules="[mandatoryFieldRule]">
            <v-radio
              v-for="servico in servicosCartao"
              :key="servico"
              :label="servico"
              :value="servico"
              color="primary"
            />
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center">
          <v-btn
            @click="geraFicha"
            color="primary"
            text="Gerar ficha"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </v-col>
      </v-row>
    </v-form>
  </v-container>

  <v-snackbar v-model="snackbar" :color="snackbarColor">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { isEmpty } from 'vuetify/lib/util/helpers.mjs';

const url = import.meta.env.VITE_API_URL;
const idChamado = ref('');
const numTerminais = ref(1);
const servicoCartaoRef = ref('SC2');
const servicosCartao = [
  'SC2',
  'SC3',
  'SC4',
  'SCS_VERO',
  'SCS_CIELO',
  'SCS_SICREDI',
  'SIMULADOR',
];

const isLoading = ref(false);
const form = ref(null);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

const resetForm = () => {
  idChamado.value = '';
  numTerminais.value = 1;
  servicoCartaoRef.value = 'SC2';
};

const showSnackbar = (message, color) => {
  snackbar.value = true;
  snackbarColor.value = color;
  snackbarText.value = message;
};

const mandatoryFieldRule = (value) =>
  isEmpty(value) ? `Campo ${value} obrigatório` : true;

const terminalsRule = (value) => {
  value = Number(value);
  return value < 1 ? 'O numero de terminais deve ser maior que zero' : true;
};

const returnFileName = (response) => {
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

    const response = await axios.post(`${url}/fichas`, payload, {
      responseType: 'blob',
    });

    downloadFile(response);
    showSnackbar('Ficha gerada com sucesso!', 'success');
    resetForm();
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

            console.error('response:', errorJson.detail);
            showSnackbar(`Erro: ${errorJson.detail}`, 'primary');
          } catch (parseError) {
            console.error('Erro:', parseError);
            showSnackbar('Falha ao fazer o parse de retorno do servidor.', 'primary');
          }
        })();
      } else {
        console.error('response:', error.response.data);
        showSnackbar('Erro na resposta do server.', 'primary');
      }
    } else if (error.request) {
      console.log(`request: ${error.message}`);
      showSnackbar(
        'Não foi possível conectar ao servidor. Verifique a rede ou se a API está online.',
        'primary'
      );
    } else {
      console.log(`error de validação: ${error.message}`);
      showSnackbar(`Erro: ${error.message}`, 'primary');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
