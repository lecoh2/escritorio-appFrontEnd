import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  catchError,
  finalize,
  forkJoin,
  of
} from 'rxjs';

import {
  ProcessoService
} from '../../../../../core/services/processo.service';

import {
  AcaoService
} from '../../../../../core/services/acao.service';

import {
  UsuarioService
} from '../../../../../core/services/usuario.service';

import {
  ProcessoPublicacaoWebJurResponse
} from '../../../../../core/models/webjur/processo-publicacao-web-jur-response';


@Component({
  selector: 'app-detalhe-processo',

  templateUrl:
    './detalhe-processo.html',

  standalone: false,

  styleUrls: [
    './detalhe-processo.css'
  ]
})
export class DetalheProcesso
  implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private processoService =
    inject(ProcessoService);

  private acaoService =
    inject(AcaoService);

  private usuarioService =
    inject(UsuarioService);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // ESTADO
  // =====================================================

  carregando = false;

  carregandoPublicacoesWebJur =
    false;

  processo: any =
    null;

  id!: string;

  abaAtiva:
    'dados' |
    'partes' |
    'webjur' |
    'complementos' =
    'dados';


  // =====================================================
  // DADOS AUXILIARES
  // =====================================================

  acoes: any[] =
    [];

  usuarios: any[] =
    [];

  publicacoesWebJur:
    ProcessoPublicacaoWebJurResponse[] =
    [];


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route
        .snapshot
        .paramMap
        .get('id');

    if (!id) {

      this.processo =
        null;

      return;
    }

    this.id =
      id;

    console.log(
      'ID PROCESSO:',
      this.id
    );

    this.carregar();
  }


  // =====================================================
  // CARREGAR PROCESSO
  // =====================================================

  carregar(): void {

    if (!this.id) {
      return;
    }

    this.carregando =
      true;

    forkJoin({

      processo:
        this.processoService
          .ObterProcessoPorId(
            this.id
          ),

      acoes:
        this.acaoService
          .consultar()
          .pipe(
            catchError(
              () => of([])
            )
          ),

      usuarios:
        this.usuarioService
          .consultarUsuarioResponsavel()
          .pipe(
            catchError(
              () => of([])
            )
          )

    })
      .pipe(

        finalize(() => {

          this.carregando =
            false;

          this.cdr
            .detectChanges();

        })

      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'PROCESSO BACKEND:',
            res.processo
          );

          this.processo =
            res.processo;

          this.acoes =
            res.acoes ?? [];

          this.usuarios =
            res.usuarios ?? [];

          this.cdr
            .detectChanges();
        },

        error: (err) => {

          console.error(
            'Erro ao carregar processo:',
            err
          );

          this.processo =
            null;

          this.cdr
            .detectChanges();
        }

      });
  }


  // =====================================================
  // MUDAR ABA
  // =====================================================

  mudarAba(
    aba:
      'dados' |
      'partes' |
      'webjur' |
      'complementos'
  ): void {

    this.abaAtiva =
      aba;

    /*
     * Sempre atualiza as publicações
     * quando a aba WebJur for aberta.
     *
     * Assim, caso uma nova publicação
     * tenha sido importada, ela aparecerá
     * imediatamente ao retornar para a aba.
     */
    if (aba === 'webjur') {

      this
        .carregarPublicacoesWebJur();
    }

    this.cdr
      .detectChanges();
  }


  // =====================================================
  // PUBLICAÇÕES WEBJUR
  // =====================================================

  carregarPublicacoesWebJur(): void {

    if (!this.id) {

      this.publicacoesWebJur =
        [];

      return;
    }

    if (
      this.carregandoPublicacoesWebJur
    ) {
      return;
    }

    this.carregandoPublicacoesWebJur =
      true;

    this.processoService
      .obterPublicacoesWebJur(
        this.id
      )
      .pipe(

        finalize(() => {

          this.carregandoPublicacoesWebJur =
            false;

          this.cdr
            .detectChanges();

        })

      )
      .subscribe({

        next: (
          res:
            ProcessoPublicacaoWebJurResponse[]
        ) => {

          console.log(
            'Publicações WebJur:',
            res
          );

          this.publicacoesWebJur =
            res ?? [];

          this.cdr
            .detectChanges();
        },

        error: (err) => {

          console.error(
            'Erro ao carregar publicações WebJur:',
            err
          );

          this.publicacoesWebJur =
            [];

          this.cdr
            .detectChanges();
        }

      });
  }


  // =====================================================
  // TRACK BY WEBJUR
  // =====================================================

  trackByPublicacao(
    index: number,
    publicacao:
      ProcessoPublicacaoWebJurResponse
  ): string {

    return publicacao.id;
  }


  // =====================================================
  // VOLTAR
  // =====================================================

  voltar(): void {

    this.router.navigate([
      '/admin/consultar-processo'
    ]);
  }


  // =====================================================
  // AÇÃO
  // =====================================================

  get nomeAcao(): string {

    return this.acoes
      .find(
        a =>
          a.idAcao ===
          this.processo?.acaoId
      )
      ?.nomeAcao
      ?? '-';
  }


  // =====================================================
  // RESPONSÁVEL
  // =====================================================

  get nomeResponsavel(): string {

    return this.usuarios
      .find(
        u =>
          u.id ===
          this.processo
            ?.usuarioResponsavelId
      )
      ?.nomeUsuario
      ?? '-';
  }
}