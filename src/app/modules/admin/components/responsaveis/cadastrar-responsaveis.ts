import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil
} from 'rxjs';

import {
  ConsultarUsuarioResponse
} from '../../../../core/models/usuario/consultar-usuarios.response';

@Component({
  selector: 'app-selecionar-responsaveis',
  standalone: false,
  templateUrl: './cadastrar-responsaveis.html'
})
export class CadastrarResponsaveis implements OnInit, OnDestroy {
  @Input() label = 'Responsáveis';

  @Input() resultados: ConsultarUsuarioResponse[] = [];

  @Input() selecionadas: ConsultarUsuarioResponse[] = [];

  @Output() selecionadasChange =
    new EventEmitter<ConsultarUsuarioResponse[]>();

  @Output() buscar = new EventEmitter<string>();

  control = new FormControl<string>('', {
    nonNullable: true
  });

  aberto = false;

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(valor => {
        const termo = valor.trim();

        this.buscar.emit(termo);
        this.aberto = true;
      });
  }

  selecionar(usuario: ConsultarUsuarioResponse): void {
    const existe = this.selecionadas.some(
      item => item.idUsuario === usuario.idUsuario
    );

    if (existe) {
      this.selecionadas = this.selecionadas.filter(
        item => item.idUsuario !== usuario.idUsuario
      );
    } else {
      this.selecionadas = [
        ...this.selecionadas,
        usuario
      ];
    }

    this.selecionadasChange.emit(this.selecionadas);

    this.control.setValue('', {
      emitEvent: false
    });

    this.aberto = false;
  }

  remover(usuario: ConsultarUsuarioResponse): void {
    this.selecionadas = this.selecionadas.filter(
      item => item.idUsuario !== usuario.idUsuario
    );

    this.selecionadasChange.emit(this.selecionadas);
  }

  isSelecionado(usuario: ConsultarUsuarioResponse): boolean {
    return this.selecionadas.some(
      item => item.idUsuario === usuario.idUsuario
    );
  }

  abrir(): void {
    this.aberto = true;

    if (this.resultados.length === 0) {
      this.buscar.emit('');
    }
  }

  fechar(): void {
    setTimeout(() => {
      this.aberto = false;
    }, 150);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/*import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConsultarUsuarioResponse } from '../../../../core/models/usuario/consultar-usuarios.response';

@Component({
  selector: 'app-selecionar-responsaveis',
  standalone: false,
  templateUrl: './cadastrar-responsaveis.html'
})
export class CadastrarResponsaveis {
  @Input() label: string = 'Responsáveis';
  @Input() resultados: ConsultarUsuarioResponse[] = [];
  @Input() selecionadas: ConsultarUsuarioResponse[] = [];

  @Output() selecionadasChange = new EventEmitter<ConsultarUsuarioResponse[]>();
  @Output() buscar = new EventEmitter<string>();

  control = new FormControl('');
  aberto = false;

  // 🔍 busca automática igual UX moderno
  ngOnInit() {
    this.control.valueChanges.subscribe(valor => {
      this.buscar.emit(valor || '');
      this.aberto = true;
    });
  }

  selecionar(usuario: ConsultarUsuarioResponse) {
    const existe = this.selecionadas.find(e => e.id === usuario.id);

    if (existe) {
      this.selecionadas = this.selecionadas.filter(e => e.id !== usuario.id);
    } else {
      this.selecionadas = [...this.selecionadas, usuario];
    }

    this.selecionadasChange.emit(this.selecionadas);
    this.control.setValue('');
    this.aberto = false;
  }

  remover(usuario: ConsultarUsuarioResponse) {
    this.selecionadas = this.selecionadas.filter(e => e.id !== usuario.id);
    this.selecionadasChange.emit(this.selecionadas);
  }

  isSelecionado(usuario: ConsultarUsuarioResponse): boolean {
    return this.selecionadas.some(e => e.id === usuario.id);
  }
}*/