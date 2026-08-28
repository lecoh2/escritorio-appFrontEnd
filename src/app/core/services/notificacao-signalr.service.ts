import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

import { environment } from '../../../environments/environment.development';
import { AuthHelper } from '../helpers/auth.helper';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoSignalRService {

  private hubConnection?: signalR.HubConnection;

  private authHelper = inject(AuthHelper);


  // =====================================================
  // INICIAR CONEXÃO
  // =====================================================

  iniciar(
    usuarioId: string,
    callback: (data: any) => void
  ): void {

    // Evita criar outra conexão se já existir
    if (
      this.hubConnection &&
      this.hubConnection.state !== signalR.HubConnectionState.Disconnected
    ) {
      return;
    }

    this.hubConnection =
      new signalR.HubConnectionBuilder()

        .withUrl(
          `${environment.apiDeslandes}/hub/notificacao`,
          {
            accessTokenFactory: () => {

              const user =
                this.authHelper.get();

              return user?.accessToken ?? '';
            }
          }
        )

        .withAutomaticReconnect()

        .build();


    // Evita duplicar o mesmo listener
    this.hubConnection.off(
      'ReceberNotificacao'
    );


    this.hubConnection.on(
      'ReceberNotificacao',
      (data: any) => {

        callback(data);

      }
    );


    this.hubConnection
      .start()
      .then(() => {

        console.log(
          'SignalR conectado.'
        );

      })
      .catch(err => {

        console.error(
          'Erro ao conectar SignalR:',
          err
        );

      });
  }


  // =====================================================
  // NOTIFICAÇÃO LIDA
  // =====================================================

  onNotificacaoLida(
    callback: (id: string) => void
  ): void {

    if (!this.hubConnection) {
      return;
    }

    this.hubConnection.off(
      'NotificacaoLida'
    );

    this.hubConnection.on(
      'NotificacaoLida',
      (id: string) => {

        callback(id);

      }
    );
  }


  // =====================================================
  // PARAR CONEXÃO
  // =====================================================

  async parar(): Promise<void> {

    if (!this.hubConnection) {
      return;
    }

    if (
      this.hubConnection.state ===
      signalR.HubConnectionState.Disconnected
    ) {
      return;
    }

    await this.hubConnection.stop();

    this.hubConnection = undefined;
  }
}