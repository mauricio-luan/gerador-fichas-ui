import { createRouter, createWebHistory } from "vue-router";
import GeradorFicha from "@/views/GeradorFicha.vue";

const rotas = [
  {
    path: "/",
    name: "GeradorFicha",
    component: GeradorFicha,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: rotas,
});

export default router;
