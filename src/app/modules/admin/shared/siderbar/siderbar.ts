import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import { AccessService } from '../../../../core/services/access.service';

import { AuthHelper } from '../../../../core/helpers/auth.helper';

import { UsuarioService } from '../../../../core/services/usuario.service';


@Component({
  selector: 'app-siderbar',
  standalone: false,
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css'
})
export class Siderbar implements OnInit {

  private authHelper =
    inject(AuthHelper);

  private usuarioService =
    inject(UsuarioService);


  nomeUsuario: string =
    '';

  usuarioLogado: any;


  constructor(
    public access: AccessService,
    private router: Router
  ) { }


  ngOnInit(): void {

    this.usuarioLogado =
      this.authHelper.get();

    this.nomeUsuario =
      this.usuarioLogado?.nomeUsuario ??
      'Usuário';
  }


  logout(): void {

    const confirmar =
      confirm(
        `Deseja realmente sair do sistema, ${this.nomeUsuario}?`
      );


    if (!confirmar) {
      return;
    }


    this.usuarioService
      .logout()
      .subscribe({

        next: () => {

          // =========================
          // REMOVE DADOS LOCAIS
          // =========================

          this.authHelper
            .remove();


          // =========================
          // REDIRECIONA LOGIN
          // =========================

          this.router.navigate([
            '/login/autenticar-usuario'
          ]);

        },


        error: (err) => {

          console.error(
            'Erro ao encerrar sessão:',
            err
          );


          /*
           * Mesmo que o backend falhe,
           * remove os dados locais.
           */
          this.authHelper
            .remove();


          this.router.navigate([
            '/login/autenticar-usuario'
          ]);

        }

      });

  }

}