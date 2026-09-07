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
  finalize
} from 'rxjs';

import {
  EtiquetaService
} from '../../../../../core/services/etiqueta.service';


@Component({
  selector: 'app-editar-etiqueta',
  standalone: false,
  templateUrl: './editar-etiqueta.html',
  styleUrl: './editar-etiqueta.css'
})
export class EditarEtiqueta implements OnInit {

  // =========================
  // INJEÇÕES
  // =========================

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private etiquetaService =
    inject(EtiquetaService);

  private fb =
    inject(FormBuilder);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  // =========================
  // ESTADO
  // =========================

  id!: string;

  carregando =
    false;

  carregandoInicial =
    true;

  mensagemErro:
    string[] = [];

  mensagemSucesso:
    string[] = [];


  // =========================
  // FORM
  // =========================

  form =
    this.fb.group({

      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      cor: [
        '#0d6efd',
        [
          Validators.required
        ]
      ]

    });


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    const idParam =
      this.route
        .snapshot
        .paramMap
        .get('id');

    if (!idParam) {

      this.mensagemErro = [
        'ID da etiqueta inválido.'
      ];

      this.carregandoInicial =
        false;

      return;
    }


    this.id =
      idParam;


    this.carregarEtiqueta();

  }


  // =========================
  // CARREGAR ETIQUETA
  // =========================

  private carregarEtiqueta(): void {

    this.carregando =
      true;

    this.mensagemErro =
      [];


    this.etiquetaService
      .obterEtiquetaPorId(
        this.id
      )
      .subscribe({

        next: (res) => {

          this.form.patchValue({

            nome:
              res.nome,

            cor:
              res.cor

          });


          this.carregando =
            false;

          this.carregandoInicial =
            false;

          this.cdr.detectChanges();

        },


        error: (err: HttpErrorResponse) => {

          this.carregando =
            false;

          this.carregandoInicial =
            false;

          this.tratarErro(err);

        }

      });

  }


  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    this.carregando =
      true;


    const formValue =
      this.form.value;


    const request = {

      nome:
        formValue.nome!,

      cor:
        formValue.cor!

    };


    this.etiquetaService
      .atualizarEtiqueta(
        this.id,
        request
      )
      .pipe(

        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: (res) => {

          this.zone.run(() => {

            this.mensagemSucesso = [

              res.message ??
              'Etiqueta atualizada com sucesso.'

            ];


            this.cdr.detectChanges();


            setTimeout(() => {

              this.router.navigate([
                '/admin/consultar-etiquetas'
              ]);

            }, 2000);

          });

        },


        error: (err: HttpErrorResponse) => {

          this.tratarErro(err);

        }

      });

  }


  // =========================
  // VOLTAR
  // =========================

  irParaLista(): void {

    this.router.navigate([
      '/admin/consultar-etiquetas'
    ]);

  }


  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.zone.run(() => {

      this.mensagemErro =
        [];

      const e =
        err.error;


      // =========================
      // FLUENT VALIDATION
      // =========================

      if (
        Array.isArray(
          e?.errors
        )
      ) {

        this.mensagemErro =
          e.errors
            .map(
              (x: any) =>
                x.erro ??
                x.errorMessage ??
                x.message
            )
            .filter(
              (x: any) =>
                !!x
            );


        this.carregando =
          false;

        this.cdr.detectChanges();

        return;

      }


      // =========================
      // BUSINESS EXCEPTION
      // =========================

      if (e?.message) {

        this.mensagemErro = [
          e.message
        ];

        this.carregando =
          false;

        this.cdr.detectChanges();

        return;

      }


      // =========================
      // FALLBACK ANTIGO
      // =========================

      if (e?.mensagem) {

        this.mensagemErro = [
          e.mensagem
        ];

        this.carregando =
          false;

        this.cdr.detectChanges();

        return;

      }


      // =========================
      // GENÉRICO
      // =========================

      this.mensagemErro = [
        'Erro inesperado.'
      ];

      this.carregando =
        false;

      this.cdr.detectChanges();

    });

  }
}