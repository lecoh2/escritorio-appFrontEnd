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

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { EscritorioService } from '../../../../../core/services/escritorio.service';

import { EscritorioRequest } from '../../../../../core/models/escritorio/escritorio-request';

@Component({
  selector: 'app-cadastrar-escritorio',
  standalone: false,
  templateUrl: './cadastrar-escritorio.html',
  styleUrls: ['./cadastrar-escritorio.css']
})
export class CadastrarEscritorio implements OnInit {

  // =========================
  // SERVICES
  // =========================

  private escritorioService =
    inject(EscritorioService);

  private builder =
    inject(FormBuilder);

  private router =
    inject(Router);

  private cd =
    inject(ChangeDetectorRef);

  // =========================
  // ESTADOS
  // =========================

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
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
      !this.carregando
    );
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.carregando = false;
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

    let documentoFormatado =
      numeros;

    if (numeros.length <= 11) {
      documentoFormatado =
        this.formatarCpf(numeros);
    } else {
      documentoFormatado =
        this.formatarCnpj(numeros);
    }

    controle.setValue(
      documentoFormatado,
      {
        emitEvent: false
      }
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

 private formatarCnpj(valor: string): string {
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

  this.cd.detectChanges();
  return;
}

    this.carregando = true;

    this.cd.detectChanges();

    const formValue =
      this.form.getRawValue();

    const request: EscritorioRequest = {
      nome:
        formValue.nome
          ?.trim() ?? '',

      documento:
        formValue.documento
          ?.replace(/\D/g, '') ?? ''
    };

    console.log(
      'Objeto request enviado:',
      JSON.stringify(request, null, 2)
    );

    this.escritorioService
      .cadastrarEscritorio(request)
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
            'Escritório cadastrado com sucesso.'
          ];

          this.form.reset();

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

  // =========================
  // FLUENT VALIDATION / MODELSTATE
  // =========================

  if (errorResponse?.errors) {
    for (
      const key in
      errorResponse.errors
    ) {
      const mensagens =
        errorResponse.errors[key];

      if (Array.isArray(mensagens)) {
        this.mensagemErro.push(
          ...mensagens
        );
      }
    }
  }

  // =========================
  // MENSAGEM PERSONALIZADA
  // =========================

  else if (
    errorResponse?.mensagem
  ) {
    this.mensagemErro.push(
      errorResponse.mensagem
    );
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

  // =========================
  // PROBLEM DETAILS
  // =========================

  else if (
    errorResponse?.title
  ) {
    this.mensagemErro.push(
      errorResponse.title
    );

    if (errorResponse.detail) {
      this.mensagemErro.push(
        errorResponse.detail
      );
    }
  }

  // =========================
  // RESPOSTA EM TEXTO
  // =========================

  else if (
    typeof errorResponse === 'string'
  ) {
    this.mensagemErro.push(
      errorResponse
    );
  }

  else {
    this.mensagemErro.push(
      'Ocorreu um erro ao cadastrar o escritório.'
    );
  }

  this.mensagemErro = [
    ...new Set(
      this.mensagemErro.filter(
        mensagem => !!mensagem
      )
    )
  ];

  console.error(
    'Erro recebido do backend:',
    e
  );

  console.error(
    'Resposta do backend:',
    errorResponse
  );

  this.cd.detectChanges();
}
}