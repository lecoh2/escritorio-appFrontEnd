import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import { EscritorioService } from '../../../../../core/services/escritorio.service';
import { EscritorioUpdateRequest } from '../../../../../core/models/escritorio/escritorioU-update-request';


@Component({
  selector: 'app-editar-escritorio',
  standalone: false,
  templateUrl: './editar-escritorio.html',
  styleUrls: ['./editar-escritorio.css']
})
export class EditarEscritorio implements OnInit {

  // =========================
  // SERVICES
  // =========================

  private escritorioService =
    inject(EscritorioService);

  private builder =
    inject(FormBuilder);

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private cd =
    inject(ChangeDetectorRef);

  // =========================
  // ESTADOS
  // =========================

  carregando = false;

  carregandoConsulta = true;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  escritorioId?: string;

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
    id: [''],

    nome: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]
    ],

    documento: [
      '',
      [
        Validators.required,
        this.documentoValidator()
      ]
    ]
  });

  // =========================
  // VALIDAR BOTÃO
  // =========================

  get podeEnviar(): boolean {
    return (
      this.form.valid &&
      !this.carregando &&
      !this.carregandoConsulta
    );
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.carregarEscritorio();
  }

  // =========================
  // CARREGAR ESCRITÓRIO
  // =========================

  carregarEscritorio(): void {
    const id =
      this.route.snapshot.paramMap
        .get('id');

    if (!id) {
      this.carregandoConsulta = false;

      this.mensagemErro = [
        'Id do escritório não informado.'
      ];

      return;
    }

    this.escritorioId = id;

    this.escritorioService
      .consultarEscritorioPorId(id)
      .pipe(
        finalize(() => {
          this.carregandoConsulta = false;

          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const escritorio =
            response?.data ??
            response;

          this.form.patchValue({
            id:
              escritorio.id,

            nome:
              escritorio.nome,

            documento:
              this.aplicarMascaraDocumento(
                escritorio.documento
              )
          });

          this.cd.detectChanges();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // FORMATAR DOCUMENTO
  // =========================

  formatarDocumento(): void {
    const controle =
      this.form.get('documento');

    if (!controle) {
      return;
    }

    const valor =
      controle.value ?? '';

    const numeros =
      valor
        .replace(/\D/g, '')
        .substring(0, 14);

    const documentoFormatado =
      numeros.length <= 11
        ? this.formatarCpf(numeros)
        : this.formatarCnpj(numeros);

    controle.setValue(
      documentoFormatado,
      {
        emitEvent: false
      }
    );
  }

  aplicarMascaraDocumento(
    documento?: string | null
  ): string {
    if (!documento) {
      return '';
    }

    const numeros =
      documento.replace(/\D/g, '');

    if (numeros.length <= 11) {
      return this.formatarCpf(
        numeros
      );
    }

    return this.formatarCnpj(
      numeros
    );
  }

  private formatarCpf(
    valor: string
  ): string {
    return valor
      .replace(
        /(\d{3})(\d)/,
        '$1.$2'
      )
      .replace(
        /(\d{3})(\d)/,
        '$1.$2'
      )
      .replace(
        /(\d{3})(\d{1,2})$/,
        '$1-$2'
      );
  }

  private formatarCnpj(
    valor: string
  ): string {
    return valor
      .replace(
        /^(\d{2})(\d)/,
        '$1.$2'
      )
      .replace(
        /^(\d{2})\.(\d{3})(\d)/,
        '$1.$2.$3'
      )
      .replace(
        /\.(\d{3})(\d)/,
        '.$1/$2'
      )
      .replace(
        /(\d{4})(\d)/,
        '$1-$2'
      );
  }

  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (!this.podeEnviar) {
      this.form.markAllAsTouched();

      this.mensagemErro = [
        'Preencha todos os campos obrigatórios corretamente.'
      ];

      return;
    }

    const id =
      this.escritorioId ??
      this.form.value.id;

    if (!id) {
      this.mensagemErro = [
        'Id do escritório não informado.'
      ];

      return;
    }

    this.carregando = true;

    this.cd.detectChanges();

    const formValue =
      this.form.getRawValue();

    const request:
      EscritorioUpdateRequest = {
        nome:
          formValue.nome
            ?.trim() ?? '',

        documento:
          formValue.documento
            ?.replace(/\D/g, '') ?? ''
      };

    console.log(
      'Objeto request enviado para edição:',
      JSON.stringify(request, null, 2)
    );

    this.escritorioService
      .editarEscritorioPorId(
        id,
        request
      )
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemErro = [];

          this.mensagemSucesso = [
            response.message ??
            'Escritório atualizado com sucesso.'
          ];

          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate([
              '/admin/consultar-escritorios'
            ]);
          }, 3000);
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // VALIDAR DOCUMENTO
  // =========================

  documentoValidator(): ValidatorFn {
    return (
      control: AbstractControl
    ): ValidationErrors | null => {
      const valor =
        control.value;

      if (!valor) {
        return null;
      }

      const documento =
        String(valor)
          .replace(/\D/g, '');

      if (
        documento.length !== 11 &&
        documento.length !== 14
      ) {
        return {
          documentoInvalido: true
        };
      }

      if (
        documento.length === 11 &&
        !this.validarCpf(documento)
      ) {
        return {
          documentoInvalido: true
        };
      }

      if (
        documento.length === 14 &&
        !this.validarCnpj(documento)
      ) {
        return {
          documentoInvalido: true
        };
      }

      return null;
    };
  }

  private validarCpf(
    cpf: string
  ): boolean {
    if (
      /^(\d)\1{10}$/.test(cpf)
    ) {
      return false;
    }

    let soma = 0;

    for (
      let indice = 0;
      indice < 9;
      indice++
    ) {
      soma +=
        Number(cpf[indice]) *
        (10 - indice);
    }

    let digito =
      (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    if (
      digito !==
      Number(cpf[9])
    ) {
      return false;
    }

    soma = 0;

    for (
      let indice = 0;
      indice < 10;
      indice++
    ) {
      soma +=
        Number(cpf[indice]) *
        (11 - indice);
    }

    digito =
      (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    return (
      digito ===
      Number(cpf[10])
    );
  }

  private validarCnpj(
    cnpj: string
  ): boolean {
    if (
      /^(\d)\1{13}$/.test(cnpj)
    ) {
      return false;
    }

    const calcularDigito = (
      base: string,
      pesos: number[]
    ): number => {
      const soma =
        base
          .split('')
          .reduce(
            (
              total,
              numero,
              indice
            ) =>
              total +
              Number(numero) *
              pesos[indice],
            0
          );

      const resto =
        soma % 11;

      return resto < 2
        ? 0
        : 11 - resto;
    };

    const primeiroDigito =
      calcularDigito(
        cnpj.substring(0, 12),
        [
          5, 4, 3, 2,
          9, 8, 7, 6,
          5, 4, 3, 2
        ]
      );

    const segundoDigito =
      calcularDigito(
        cnpj.substring(0, 12) +
        primeiroDigito,
        [
          6, 5, 4, 3,
          2, 9, 8, 7,
          6, 5, 4, 3,
          2
        ]
      );

    return (
      primeiroDigito ===
        Number(cnpj[12]) &&
      segundoDigito ===
        Number(cnpj[13])
    );
  }

  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(
    e: any
  ): void {
    const errorResponse =
      e?.error;

    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (
        const key in
        errorResponse.errors
      ) {
        if (
          Array.isArray(
            errorResponse.errors[key]
          )
        ) {
          this.mensagemErro.push(
            ...errorResponse.errors[key]
          );
        }
      }
    }

    else if (
      errorResponse?.mensagem
    ) {
      this.mensagemErro.push(
        errorResponse.mensagem
      );

      if (
        errorResponse.detalhes
      ) {
        this.mensagemErro.push(
          errorResponse.detalhes
        );
      }

      else if (
        errorResponse.Detalhes
      ) {
        this.mensagemErro.push(
          errorResponse.Detalhes
        );
      }
    }

    else if (
      errorResponse?.message
    ) {
      this.mensagemErro.push(
        errorResponse.message
      );
    }

    else if (
      errorResponse?.Message
    ) {
      this.mensagemErro.push(
        errorResponse.Message
      );
    }

    else {
      this.mensagemErro.push(
        'Ocorreu um erro inesperado ao atualizar o escritório.'
      );
    }

    this.mensagemErro = [
      ...new Set(
        this.mensagemErro
      )
    ];

    console.error(
      'Erro recebido do backend:',
      e
    );

    this.cd.detectChanges();
  }
}