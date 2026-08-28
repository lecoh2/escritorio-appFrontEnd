import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  FormControl
} from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

@Component({
  selector: 'app-vinculo',
  standalone: false,
  templateUrl: './vinculo.html',
    styleUrl: './vinculo.css'
})
export class Vinculo {

  control =
    new FormControl<string>(
      '',
      {
        nonNullable: true
      }
    );

  mostrarSugestoes = false;

  @Input()
  tipoVinculo: string | null = null;

  @Input()
  resultados: any[] = [];

  private _vinculoSelecionado: any;

  @Input()
  set vinculoSelecionado(
    value: any
  ) {

    console.log(
      'CHEGOU NO COMPONENTE:',
      value
    );

    this._vinculoSelecionado =
      value;

    if (value) {

      const label =
        this.getLabel(
          value
        );

      setTimeout(() => {

        this.control.setValue(
          label,
          {
            emitEvent: false
          }
        );

      });

      return;
    }

    this.control.setValue(
      '',
      {
        emitEvent: false
      }
    );
  }

  get vinculoSelecionado(): any {

    return this._vinculoSelecionado;
  }

  @Output()
  buscar =
    new EventEmitter<string>();

  @Output()
  selecionado =
    new EventEmitter<any>();

  constructor() {

    this.control
      .valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(valor => {

        const termo =
          valor
            .toString()
            .trim();

        if (
          termo.length >= 2
        ) {

          this.mostrarSugestoes =
            true;

          this.buscar.emit(
            termo
          );

          return;
        }

        this.mostrarSugestoes =
          false;

        this.buscar.emit(
          ''
        );
      });
  }

  selecionar(
    item: any
  ): void {

    this.control.setValue(
      this.getLabel(item),
      {
        emitEvent: false
      }
    );

    this.mostrarSugestoes =
      false;

    this.selecionado.emit(
      item
    );
  }

  // ===================================================
  // LABEL DO VÍNCULO
  // ===================================================

  getLabel(
    item: any
  ): string {

    if (!item) {
      return '';
    }

    // ===================================================
    // PROCESSO
    // ===================================================

    if (
      this.tipoVinculo === 'processo' ||
      item.numeroProcesso
    ) {

      const numeroProcesso =
        this.formatarProcesso(
          item.numeroProcesso
        );

      const partes: string[] = [];

      if (numeroProcesso) {
        partes.push(
          numeroProcesso
        );
      }

      if (item.pasta) {
        partes.push(
          item.pasta
        );
      }

      if (item.titulo) {
        partes.push(
          item.titulo
        );
      }

      return partes.join(
        ' - '
      );
    }

    // ===================================================
    // ATENDIMENTO
    // ===================================================

    if (
      this.tipoVinculo === 'atendimento' ||
      item.numeroControle ||
      item.codigoControle !== undefined
    ) {

      if (
        item.numeroControle
      ) {

        return item.assunto
          ? `${item.numeroControle} - ${item.assunto}`
          : item.numeroControle;
      }

      if (
        item.codigoControle !== null &&
        item.codigoControle !== undefined &&
        item.anoBaseControle
      ) {

        const numeroControle =
          this.formatarNumeroControle(
            item.codigoControle,
            item.anoBaseControle
          );

        return item.assunto
          ? `${numeroControle} - ${item.assunto}`
          : numeroControle;
      }

      if (
        item.assunto
      ) {
        return item.assunto;
      }
    }

    // ===================================================
    // CASO
    // ===================================================

    if (
      this.tipoVinculo === 'caso'
    ) {

      const partes: string[] = [];

      if (item.pasta) {
        partes.push(
          item.pasta
        );
      }

      if (item.titulo) {
        partes.push(
          item.titulo
        );
      }

      return partes.join(
        ' - '
      );
    }

    // ===================================================
    // FALLBACK
    // ===================================================

    if (item.titulo) {
      return item.titulo;
    }

    if (item.assunto) {
      return item.assunto;
    }

    if (item.pasta) {
      return item.pasta;
    }

    return '';
  }

  // ===================================================
  // ABRIR
  // ===================================================

  abrir(): void {

    const termo =
      this.control
        .value
        .toString()
        .trim();

    if (
      termo.length >= 2
    ) {
      this.mostrarSugestoes =
        true;
    }
  }

  // ===================================================
  // FECHAR
  // ===================================================

  fechar(): void {

    setTimeout(
      () => {

        this.mostrarSugestoes =
          false;

      },
      200
    );
  }

  // ===================================================
  // FORMATAÇÃO ATENDIMENTO
  // ===================================================

  formatarNumeroControle(
    codigo: number,
    anoBase: string
  ): string {

    return (
      `${codigo
        .toString()
        .padStart(
          6,
          '0'
        )}/${anoBase}`
    );
  }

  // ===================================================
  // FORMATAÇÃO PROCESSO
  // ===================================================

  formatarProcesso(
    numero?: string
  ): string {

    if (!numero) {
      return '';
    }

    const numeros =
      numero.replace(
        /\D/g,
        ''
      );

    // Processo antigo
    if (
      numeros.length === 13
    ) {

      return numeros.replace(
        /(\d{3})(\d{6})(\d{4})/,
        '$1/$2/$3'
      );
    }

    // CNJ
    if (
      numeros.length === 20
    ) {

      return (
        `${numeros.slice(0, 7)}-` +
        `${numeros.slice(7, 9)}.` +
        `${numeros.slice(9, 13)}.` +
        `${numeros.slice(13, 14)}.` +
        `${numeros.slice(14, 16)}.` +
        `${numeros.slice(16, 20)}`
      );
    }

    return numero;
  }
}