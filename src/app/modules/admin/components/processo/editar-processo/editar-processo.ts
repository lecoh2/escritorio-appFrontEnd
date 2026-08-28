
declare var bootstrap: any;
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProcessoService } from "../../../../../core/services/processo.service";
import { AuthHelper } from "../../../../../core/helpers/auth.helper";
import { VaraService } from "../../../../../core/services/vara.service";
import { UsuarioService } from "../../../../../core/services/usuario.service";
import { AcaoService } from "../../../../../core/services/acao.service";
import { PessoaService } from "../../../../../core/services/pessoa.service";
import { QualificacoesService } from "../../../../../core/services/qualificacoes.service";
import { EtiquetaService } from "../../../../../core/services/etiqueta.service";
import { inject, OnInit } from "@angular/core";
import { InstanciaEnum } from "../../../../../core/models/enums/intancia/instanciaEnum";
import { AcessoEnum } from "../../../../../core/models/enums/acesso/acesoEnum";
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { ConsultarVaraResponse } from '../../../../../core/models/vara/consultar-vara-response';
import { ConsultarAcaoResponse } from '../../../../../core/models/acao/consultar-acao-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { HistoricoService } from '../../../../../core/services/historico.service';
import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';


@Component({
  selector: 'app-editar-processo',
  standalone: false,
  templateUrl: './editar-processo.html',
  styleUrl: './editar-processo.css',
})


export class EditarProcesso implements OnInit {
  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private varaService = inject(VaraService);
  private acaoService = inject(AcaoService);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);
  private etiquetaService = inject(EtiquetaService);
  private historicoService = inject(HistoricoService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  historico: any[] = [];
  carregandoHistorico = false;
  id!: string;

  carregando = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  foros: { id: string, nome: string }[] = [];

  varas: ConsultarVaraResponse[] = [];
  varasFiltradas: ConsultarVaraResponse[] = [];

  acoes: ConsultarAcaoResponse[] = [];

  responsaveis: ConsultarUsuarioResponse[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  //  AGORA PADRONIZADO
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

  instanciaEnum = InstanciaEnum;
  acessoEnum = AcessoEnum;

  tentouEnviar = false;
  form = this.builder.group({
    acaoId: [null],
    foroId: [null],
    varaId: [null, Validators.required],
    usuarioResponsavelId: [null],
    juizo: [''],
    pasta: ['', Validators.required],
    titulo: ['', Validators.required],
    numeroProcesso: ['', Validators.required],
    linkTribunal: [''],
    objeto: [''],
    valorCausa: this.builder.control<number | null>(null),
    valorCondenacao: this.builder.control<number | null>(null),
    distribuido: [null],

    observacao: [''],
    instancia: [null],
    acesso: [null],
  });
  private carregarDadosIniciais() {
    this.carregando = true;
    this.mensagemErro = [];

    forkJoin({
      varas: this.varaService.consultar(),
      acoes: this.acaoService.consultar(),
      usuarios: this.usuarioService.consultarUsuarioResponsavel(),
      qualificacoes: this.qualificacaoService.consultarQualificacoes(),
      etiquetas: this.etiquetaService.consultar()
    }).subscribe({
      next: (res) => {

        const { varas, acoes, usuarios, qualificacoes, etiquetas } = res as {
          varas: ConsultarVaraResponse[];
          acoes: ConsultarAcaoResponse[];
          usuarios: ConsultarUsuarioResponse[];
          qualificacoes: QualificacaoResponse[];
          etiquetas: ConsultarEtiquetaResponse[];
        };

        // 🔥 VARAS + FOROS
        this.varas = varas;
        this.varasFiltradas = varas;

        const mapa = new Map<string, string>();
        varas.forEach(v => {
          if (v.foroId && v.nomeForo) {
            mapa.set(v.foroId, v.nomeForo);
          }
        });

        this.foros = Array.from(mapa, ([id, nome]) => ({ id, nome }));

        // 🔥 OUTROS DADOS
        this.acoes = acoes;
        this.responsaveis = usuarios;
        this.qualificacoes = qualificacoes;
        this.tiposetiquetas = etiquetas;

        // 🔥 IMPORTANTE (somente no EDITAR)
        if (this.id) {
          this.carregarProcesso();
        }
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar dados iniciais'];
        this.carregando = false;
      },
      complete: () => {
        this.carregando = false;
      }
    });
  } irParaLista(): void {
    this.router.navigate(['/admin/consultar-processo']);
  }
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
  }

  buscarEnvolvidos(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.envolvidosFiltradas = res);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.carregarDadosIniciais();
    this.carregarProcesso();

    this.form.get('foroId')?.valueChanges.subscribe(foroId => {
      if (!foroId) {
        this.varasFiltradas = this.varas;
        return;
      }

      this.varasFiltradas = this.varas.filter(v => v.foroId === foroId);
      this.form.get('varaId')?.setValue(null);
    });
  }
  get juizoFormatado(): string {
    const varaId = this.form.value.varaId;

    if (!varaId) return '';

    const vara = this.varas.find(v => v.id === varaId);

    if (!vara) return '';

    return `${vara.nomeVara} - ${vara.nomeForo}`;
  }
  // ================= CARREGAR PROCESSO =================
  private carregarProcesso(): void {

    this.carregando = true;

    this.processoService
      .ObterProcessoPorId(this.id)
      .subscribe({

        next: (res: any) => {

          console.log(
            '🔥 PROCESSO BACKEND:',
            res
          );

          // =========================
          // FORM
          // =========================

          this.form.patchValue({

            acaoId:
              res.acaoId,

            varaId:
              res.varaId,

            foroId:
              res.foroId,

            usuarioResponsavelId:
              res.usuarioResponsavelId,

            juizo:
              res.juizo,

            pasta:
              res.pasta,

            titulo:
              res.titulo,

            numeroProcesso:
              res.numeroProcesso,

            linkTribunal:
              res.linkTribunal,

            objeto:
              res.objeto,

            valorCausa:
              res.valorCausa,

            distribuido:
              res.distribuido,

            valorCondenacao:
              res.valorCondenacao,

            observacao:
              res.observacao,

            instancia:
              res.instancia,

            acesso:
              res.acesso

          }, {
            emitEvent: false
          });

          // =========================
          // FORMATAR VALORES NA TELA
          // =========================

          setTimeout(() => {

            const valorCausaInput =
              document.querySelector(
                '[formControlName="valorCausa"]'
              ) as HTMLInputElement | null;

            const valorCondenacaoInput =
              document.querySelector(
                '[formControlName="valorCondenacao"]'
              ) as HTMLInputElement | null;

            if (valorCausaInput) {

              valorCausaInput.value =
                this.formatarMoedaInput(
                  res.valorCausa
                );

            }

            if (valorCondenacaoInput) {

              valorCondenacaoInput.value =
                this.formatarMoedaInput(
                  res.valorCondenacao
                );

            }

          });

          // =========================
          // CLIENTES
          // =========================

          this.pessoasSelecionadas =
            (
              res.grupoClienteProcesso ??
              []
            )
              .map((c: any) => ({

                id:
                  c.idPessoa,

                nome:
                  c.nome,

                idQualificacao:
                  c.qualificacaoId

              }));

          // =========================
          // ENVOLVIDOS
          // =========================

          this.envolvidosSelecionados =
            (
              res.grupoEnvolvidosProcesso ??
              []
            )
              .map((e: any) => ({

                id:
                  e.idPessoa,

                nome:
                  e.nome,

                idQualificacao:
                  e.qualificacaoId

              }));

          // =========================
          // ETIQUETAS
          // =========================

          this.etiquetasSelecionadas =
            (
              res.grupoEtiquetasProcesso ??
              []
            )
              .map((e: any) => ({

                id:
                  e.idEtiqueta,

                nome:
                  e.nome,

                cor:
                  e.cor

              }));

          // =========================
          // FINALIZA
          // =========================

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar processo'
          ];

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }
  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.tentouEnviar = true;

    // =========================
    // VALIDAR FORMULÁRIO
    // =========================

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // =========================
    // VALIDAR CLIENTE
    // =========================

    if (
      !this.pessoasSelecionadas ||
      this.pessoasSelecionadas.length === 0
    ) {
      this.mensagemErro = [
        'É obrigatório selecionar pelo menos um cliente.'
      ];

      return;
    }

    // =========================
    // QUALIFICAÇÃO DOS CLIENTES
    // =========================

    if (
      this.pessoasSelecionadas.some(
        p => !p.idQualificacao
      )
    ) {
      this.mensagemErro = [
        'Selecione a qualificação para todos os clientes.'
      ];

      return;
    }

    // =========================
    // QUALIFICAÇÃO DOS ENVOLVIDOS
    // =========================

    if (
      this.envolvidosSelecionados.some(
        e => !e.idQualificacao
      )
    ) {
      this.mensagemErro = [
        'Selecione a qualificação para todos os envolvidos.'
      ];

      return;
    }

    // =========================
    // CARREGAMENTO
    // =========================

    this.carregando = true;

    // =========================
    // DADOS DO FORM
    // =========================

    const f =
      this.form.getRawValue();

    const limpar =
      (v: any) =>
        v ?? undefined;

    // =========================
    // REQUEST
    // =========================

    const request = {

      acaoId:
        limpar(f.acaoId),

      varaId:
        f.varaId!,

      usuarioResponsavelId:
        limpar(
          f.usuarioResponsavelId
        ),

      juizo:
        limpar(f.juizo),

      pasta:
        limpar(f.pasta),

      titulo:
        limpar(f.titulo),

      numeroProcesso:
        limpar(f.numeroProcesso),

      linkTribunal:
        limpar(f.linkTribunal),

      objeto:
        limpar(f.objeto),

      valorCausa:
        limpar(f.valorCausa),

      distribuido:
        limpar(f.distribuido),

      valorCondenacao:
        limpar(f.valorCondenacao),

      observacao:
        limpar(f.observacao),

      instancia:
        limpar(f.instancia),

      acesso:
        limpar(f.acesso),

      // =========================
      // CLIENTES
      // =========================

      grupoClienteProcesso:
        this.pessoasSelecionadas
          .map(p => ({
            idPessoa:
              p.id,

            idQualificacao:
              p.idQualificacao
          })),

      // =========================
      // ENVOLVIDOS
      // =========================

      grupoEnvolvidosProcesso:
        this.envolvidosSelecionados
          .map(e => ({
            idPessoa:
              e.id,

            idQualificacao:
              e.idQualificacao
          })),

      // =========================
      // ETIQUETAS
      // =========================

      grupoEtiquetasProcesso:
        this.etiquetasSelecionadas
          .map(e => ({
            etiquetaId:
              e.id
          }))
    };

    // =========================
    // ENVIAR
    // =========================

    this.processoService
      .editarProcesso(
        this.id,
        request
      )
      .subscribe({

        next: (res: any) => {

          this.carregando = false;

          this.mensagemSucesso = [
            res.message ??
            'Processo atualizado com sucesso'
          ];

          this.cdr.detectChanges();

          setTimeout(() => {

            this.router.navigate([
              '/admin/consultar-processo'
            ]);

          }, 3000);
        },

        error: (err) => {

          this.tratarErro(err);

        }

      });
  }
  private tratarErro(err: HttpErrorResponse): void {

    this.zone.run(() => {

      this.mensagemErro = [];

      const e = err?.error;

      if (e?.errors) {

        for (const key in e.errors) {
          this.mensagemErro.push(...e.errors[key]);
        }

      }
      else if (e?.mensagem) {
        this.mensagemErro.push(e.mensagem);
      }
      else if (e?.message) {
        this.mensagemErro.push(e.message);
      }
      else {
        this.mensagemErro.push('Erro inesperado.');
      }

      this.carregando = false;

      console.log('ERRO BACKEND:', e);

      // 🔥 FORÇA UI ATUALIZAR IMEDIATAMENTE
      this.cdr.detectChanges();
    });
  }

  abrirHistoricoProcesso(processoId: string) {

    this.carregandoHistorico = true;
    this.historico = [];

    const modal =
      new bootstrap.Modal(
        this.modalHistorico.nativeElement
      );

    modal.show();

    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Processo,
        processoId
      )
      .subscribe({

        next: (res) => {

          this.historico = (res ?? []).map(h => ({
            ...h,
            antes: h.dadosAntes
              ? JSON.parse(h.dadosAntes)
              : null,

            depois: h.dadosDepois
              ? JSON.parse(h.dadosDepois)
              : null
          }));

          this.carregandoHistorico = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(err);

          this.carregandoHistorico = false;
        }

      });
  }

  getMudancas(h: any): { campo: string, antes: any, depois: any }[] {
    if (!h.antes || !h.depois) return [];

    const mudancas: any[] = [];

    Object.keys(h.depois).forEach(key => {
      const antes = h.antes[key];
      const depois = h.depois[key];

      if (JSON.stringify(antes) !== JSON.stringify(depois)) {
        mudancas.push({ campo: key, antes, depois });
      }
    });

    return mudancas;
  } formatarValor(valor: any, campo: string): string {

    if (valor === null || valor === undefined) return '-';

    // ARRAY (Responsáveis)
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }

    // BOOLEAN
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    // STATUS

    // DATA
    if (campo.toLowerCase().includes('data')) {
      return new Date(valor).toLocaleDateString('pt-BR');
    }

    // HORA
    if (campo.toLowerCase().includes('hora')) {
      return valor;
    }

    return valor.toString();
  }

  formatarCampo(campo: string): string {

    const map: any = {
      Titulo: 'Título',
      Pasta: 'Pasta',
      NumeroProcesso: 'Número do Processo',
      LinkTribunal: 'Link Tribunal',
      Objeto: 'Objeto',
      ValorCausa: 'Valor da Causa',
      ValorCondenacao: 'Valor da Condenação',
      Distribuido: 'Distribuído',
      Observacao: 'Observação',
      Instancia: 'Instância',
      Acesso: 'Acesso',
      NomeVara: 'Vara',
      NomeForo: 'Foro',
      Clientes: 'Clientes',
      Envolvidos: 'Envolvidos',
      Etiquetas: 'Etiquetas'
    };

    return map[campo] || campo;
  }
  onMoneyInput(
    event: any,
    campo: 'valorCausa' | 'valorCondenacao'
  ): void {

    const value =
      event.target.value.replace(
        /\D/g,
        ''
      );

    if (!value) {

      this.form
        .get(campo)
        ?.setValue(
          null,
          {
            emitEvent: false
          }
        );

      event.target.value = '';

      return;
    }

    const numericValue =
      Number(value) / 100;

    const formatted =
      new Intl.NumberFormat(
        'pt-BR',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )
        .format(
          numericValue
        );

    this.form
      .get(campo)
      ?.setValue(
        numericValue,
        {
          emitEvent: false
        }
      );

    event.target.value =
      formatted;
  }
  formatarMoedaInput(
    valor?: number | null
  ): string {

    if (
      valor === null ||
      valor === undefined
    ) {
      return '';
    }

    return new Intl.NumberFormat(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(valor);
  }
}
