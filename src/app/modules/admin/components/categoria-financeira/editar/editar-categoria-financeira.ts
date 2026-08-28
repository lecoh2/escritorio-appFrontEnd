import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  CategoriaFinanceiraService
} from '../../../../../core/services/categoria-financeira.service';

import {
  CategoriaFinanceiraUpdateRequest
} from '../../../../../core/models/categoria-financeira/categoria-financeira-update-request';


@Component({
  selector: 'app-editar-categoria-financeira',
  standalone: false,
  templateUrl: './editar-categoria-financeira.html',
  styleUrl: './editar-categoria-financeira.css'
})
export class EditarCategoriaFinanceira
  implements OnInit {

  private builder =
    inject(FormBuilder);

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private categoriaFinanceiraService =
    inject(CategoriaFinanceiraService);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  id!: string;

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  form = this.builder.group({

    nome: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    descricao: [
      '',
      Validators.maxLength(500)
    ],

    tipo: [
      null as number | null,
      Validators.required
    ]

  });


  get podeEnviar(): boolean {

    return (
      this.form.valid &&
      !this.carregando
    );
  }


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.id =
      this.route.snapshot.paramMap.get('id')!;

    this.carregarCategoriaFinanceira();
  }


  // =====================================================
  // VOLTAR
  // =====================================================

  irParaLista(): void {

    this.router.navigate([
      '/admin/consultar-categoria-financeira'
    ]);
  }


  // =====================================================
  // CARREGAR
  // =====================================================

  carregarCategoriaFinanceira(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.categoriaFinanceiraService
      .obterCategoriaFinanceiraPorId(
        this.id
      )
      .subscribe({

        next: (res) => {

          this.form.patchValue({

            nome:
              res.nome,

            descricao:
              res.descricao ?? '',

            tipo:
              res.tipo

          });

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(err);
        }

      });
  }


  // =====================================================
  // SALVAR
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }

    this.carregando = true;


    const request:
      CategoriaFinanceiraUpdateRequest = {

      nome:
        this.form.value.nome!.trim(),

      descricao:
        this.form.value.descricao?.trim() ?? '',

      tipo:
        this.form.value.tipo!

    };


    this.categoriaFinanceiraService
      .editarCategoriaFinanceira(
        this.id,
        request
      )
      .subscribe({

        next: (res: any) => {

          this.carregando = false;

          this.mensagemSucesso = [

            res.message ??
            'Categoria financeira atualizada com sucesso.'

          ];

          this.cdr.detectChanges();


          setTimeout(() => {

            this.router.navigate([

              '/admin/consultar-categoria-financeira'

            ]);

          }, 3000);

        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(err);
        }

      });

  }


  // =====================================================
  // ERROS
  // =====================================================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.zone.run(() => {

      this.mensagemErro = [];

      const e =
        err?.error;


      if (
        e?.errors
      ) {

        for (
          const key in e.errors
        ) {

          this.mensagemErro.push(
            ...e.errors[key]
          );
        }

      } else if (
        e?.mensagem
      ) {

        this.mensagemErro.push(
          e.mensagem
        );

      } else if (
        e?.message
      ) {

        this.mensagemErro.push(
          e.message
        );

      } else {

        this.mensagemErro.push(
          'Erro inesperado.'
        );
      }


      this.carregando = false;

      this.cdr.detectChanges();

    });

  }

}