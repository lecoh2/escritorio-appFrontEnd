import { NgModule } from "@angular/core";
import { AdminRoutingModule } from "./admin-routing.module";
import { Siderbar } from "./shared/siderbar/siderbar";
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PainelPrincipal } from "./components/painel-principal/painel-principal";
import { AdminLayout } from "./layouts/layouts/admin-layout/admin-layout";
import { CadastrarPessoas } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas";
import { EditarPessoaFisica } from "./components/pessoa/editar-pessoa-fisica/editar-pessoa-fisica";

import { CadastrarEtiquetas } from "./components/etiquetas/cadastrar-etiquetas/cadastrar-etiquetas";
import { ConsultarPessoas } from "./components/pessoa/consultar-pessoas/consultar-pessoas";
import { CadastrarProcesso } from "./components/processo/cadastrar-processo/cadastrar-processo";
import { AutocompletePessoa } from "./components/autocomplete-pessoas/autocomplete-pessoas";
import { CadastrarAtendimento } from "./components/atendimento/cadastrar-atendimento/cadastrar-atendimento";
import { AutocompletePessoaAtendimento } from "./components/autocomplete-pessoas-atendimento/autocomplete-pessoa-atendimento";
import { Vinculo } from "./components/auto-complete-vinculos-proc-caso-atend/vinculo";
import { CadastrarCaso } from "./components/caso/cadastrar-caso/cadastrar-caso";
import { GestaoAtividades } from "./components/gestao-atividades/gestao/gestao-atividades";
import { CadastrarTarefa } from "./components/tarefa/cadastrar-tarefa/cadastar-tarefa/cadastar-tarefa";
import { CadastrarResponsaveis } from "./components/responsaveis/cadastrar-responsaveis";
import { AutocompleteListaTarefas } from "./components/auto-complete-lista-tarefas/autocomplete-lista-tarefas";
import { CadastrarEvento } from "./components/evento/cadastrar-evento/cadastrar-evento";
import { EditarCaso } from "./components/caso/editar-caso/editar-caso";
import { EditarTarefa } from "./components/tarefa/editar-tarefa/editar-tarefa";
import { EditarEvento } from "./components/evento/editar-evento/editar-evento";
import { ConsultarAtendimento } from "./components/atendimento/consultar-atendimento/consultar-atendimento";
import { EditarAtendimento } from "./components/atendimento/editar-atendimento/editar-atendimento";
import { ConsultarCaso } from "./components/caso/consultar-caso/consultar-caso";
import { ConsultarProcesso } from "./components/processo/consultar-processo/consultar-processo";
import { EditarProcesso } from "./components/processo/editar-processo/editar-processo";
import { ConsultarTarefa } from "./components/tarefa/consultar-tarefa/consultar-tarefa";
import { ConsultarEvento } from "./components/evento/consultar-evento/consultar-evento";
import { Agenda } from "./components/gestao-atividades/agenda/agenda";
import { Calendario } from "./components/calendario/calendario";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CriarUsuario } from "./components/usuario/criar-usuario/criar-usuario";
import { Perfil } from "./components/usuario/perfil/perfil";
import { EditarUsuario } from "./components/usuario/editar-usuario/editar-usuario";
import { ConsultarUsuarios } from "./components/usuario/consultar-usuarios/consultar-usuarios";
import { CadastrarContrato } from "./components/contrato/cadastrar/cadastrar-contrato";
import { CadastrarCentroCusto } from "./components/centro-custo/cadatrar/cadastrar-centro-custo";
import { ConsultarCentroCusto } from "./components/centro-custo/consultar/consultar-centro-custo";
import { EditarCentroCusto } from "./components/centro-custo/editar/editar-centro-custo";
import { ConsultarContrato } from "./components/contrato/consultar/consultar-contrato";
import { AutocompletePessoaUnica } from "./components/auto-complete-pessoa-unica/auto-complete-pessoa-unica";
import { EditarContrato } from "./components/contrato/editar/editar-contrato";
import { CadastrarContaReceber } from "./components/conta-receber/cadastrar/cadastrar-conta-receber";
import { ConsultarContaReceber } from "./components/conta-receber/consultar/consultar-conta-receber";
import { VisualizarContaReceber } from "./components/conta-receber/visualizar/visualizar-conta-receber";
import { EditarContaReceber } from "./components/conta-receber/editar/editar-conta-receber";
import { CadastrarContaPagar } from "./components/conta-pagar/cadastrar/cadastrar-conta-pagar";
import { ConsultarContaPagar } from "./components/conta-pagar/consultar/consultar-conta-pagar";
import { VisualizarContaPagar } from "./components/conta-pagar/visualizar/visualizar-conta-pagar";
import { DashboardFinanceiro } from "./components/dashboard-financeiro/dashboard-financeiro";
import { ConfiguracaoFinanceira } from "./components/configuracao-financeira/configuracao-financeira";

import { DetalhePublicacao } from "./components/webjur/detalhes/detalhe-publicacao";
import { DetalheProcesso } from "./components/processo/detalhes/detalhe-processo";
import { ConsultarWebjur } from "./components/webjur/consulta/consultar-webjur";
import { EditarPessoaJuridica } from "./components/pessoa/editar-pessoa-juridica/editar-pessoa-juridica";
import { CadastrarLicenca } from "./components/licenca/cadastrar-licenca/cadastrar-licenca";
import { EditarLicenca } from "./components/licenca/editar-licenca/editar-licenca";
import { ConsultarLicencas } from "./components/licenca/consultar-licencas/consultar-licencas";
import { CadastrarEscritorio } from "./components/escritorio/cadastrar-escritorio/cadastrar-escritorio";
import { ConsultarEscritorios } from "./components/escritorio/consultar-escritorio/consultar-escritorios";
import { EditarEscritorio } from "./components/escritorio/editar-escritorio/editar-escritorio";
import { CadastrarCategoriaFinanceira } from "./components/categoria-financeira/cadastrar/cadastrar-categoria-financeira";
import { ConsultarCategoriaFinanceira } from "./components/categoria-financeira/consultar/consultar-categoria-financeira";
import { EditarCategoriaFinanceira } from "./components/categoria-financeira/editar/editar-categoria-financeira";
import { ConfiguracaoWebjur } from "./components/webjur/configuracao/configuracao-webjur";

@NgModule({
    declarations: [//componente do módulo

        Agenda,
        Calendario,
        AdminLayout,
        PainelPrincipal,
        CadastrarPessoas,
        EditarPessoaFisica,
        EditarPessoaJuridica,
        CadastrarEtiquetas,
        ConsultarPessoas,
        CadastrarProcesso,
        ConsultarProcesso,
        EditarProcesso,
        DetalheProcesso,
        CadastrarAtendimento,
        ConsultarAtendimento,
        EditarAtendimento,
        CadastrarCaso,
        ConsultarCaso,
        EditarCaso,
        GestaoAtividades,
        CadastrarTarefa,
        EditarTarefa,
        ConsultarTarefa,
        CadastrarEvento,
        EditarEvento,
        ConsultarEvento,
        CriarUsuario,
        EditarUsuario,
        ConsultarUsuarios,
        Perfil,
        CadastrarContrato,
        ConsultarContrato,
        EditarContrato,
        CadastrarCentroCusto,
        ConsultarCentroCusto,
        EditarCentroCusto,
        CadastrarContaReceber,
        ConsultarContaReceber,
        VisualizarContaReceber,
        EditarContaReceber,
        CadastrarContaPagar,
        ConsultarContaPagar,
        VisualizarContaPagar,
        DashboardFinanceiro,
        ConfiguracaoFinanceira,
        ConsultarWebjur,
        ConfiguracaoWebjur,
        DetalhePublicacao,
        CadastrarLicenca,
        EditarLicenca,
        ConsultarLicencas,
        CadastrarEscritorio,
        ConsultarEscritorios,
        EditarEscritorio,
      CadastrarCategoriaFinanceira,
      ConsultarCategoriaFinanceira,
      EditarCategoriaFinanceira,


        //autocomplete
        AutocompletePessoa,
        AutocompletePessoaAtendimento,
        AutocompleteListaTarefas,
        AutocompletePessoaUnica,
        CadastrarResponsaveis,
        Vinculo,

        //siderbar, navbar, footer
        Siderbar,
        Navbar,
        Footer,
    ],
    imports: [//biblioteca e configuração do módulo
        AdminRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        DragDropModule,

        NgxMaskDirective,
        FullCalendarModule,
    ]
})
export class AdminModule { }