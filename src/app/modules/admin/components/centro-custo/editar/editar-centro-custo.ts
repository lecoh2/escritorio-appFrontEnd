import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from "@angular/core";
import { CentroCustoService } from "../../../../../core/services/centro-custo.service";
import { ActivatedRoute, Router } from "@angular/router";

import { FormBuilder, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { CentroCustoUpdateRequest } from "../../../../../core/models/centro-custo/centro-custo-update-request";

@Component({
    selector: 'app-editar-centro-custo',
    standalone: false,
    templateUrl: './editar-centro-custo.html',
    styleUrl: './editar-centro-custo.css'
})
export class EditarCentroCusto implements OnInit {

    private builder = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private centroCustoService = inject(CentroCustoService);
    private cdr = inject(ChangeDetectorRef);
    private zone = inject(NgZone);

    id!: string;

    carregando = false;

    mensagemErro: string[] = [];
    mensagemSucesso: string[] = [];

    form = this.builder.group({
        nome: ['', Validators.required],
        descricao: [''],
        ativo: [true]
    });

    get podeEnviar(): boolean {
        return this.form.valid && !this.carregando;
    }

    ngOnInit(): void {


        this.id = this.route.snapshot.paramMap.get('id')!;

        this.carregarCentroCusto();


    }

    irParaLista(): void {
        this.router.navigate(['/admin/consultar-centro-custo']);
    }

    carregarCentroCusto() {


        this.carregando = true;

        this.centroCustoService
            .obterCentroCustoPorId(this.id)
            .subscribe({
                next: (res) => {

                    this.form.patchValue({
                        nome: res.nome,
                        descricao: res.descricao,
                          ativo: res.ativo
                    });

                    this.carregando = false;
                },
                error: () => {

                    this.mensagemErro = [
                        'Erro ao carregar centro de custo.'
                    ];

                    this.carregando = false;
                }
            });


    }

onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
    }

    this.carregando = true;

    const request: CentroCustoUpdateRequest = {
        nome: this.form.value.nome!,
        descricao: this.form.value.descricao ?? '',
        ativo: this.form.value.ativo ?? true
    };

    this.centroCustoService
        .editarCentroCusto(this.id, request)
        .subscribe({
            next: (res: any) => {

                this.carregando = false;

                this.mensagemSucesso = [
                    res.message ??
                    'Centro de custo atualizado com sucesso.'
                ];

                this.cdr.detectChanges();

                setTimeout(() => {
                    this.router.navigate([
                        '/admin/consultar-centro-custo'
                    ]);
                }, 3000);
            },

            error: (err: HttpErrorResponse) => {
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

            } else if (e?.mensagem) {

                this.mensagemErro.push(e.mensagem);

            } else if (e?.message) {

                this.mensagemErro.push(e.message);

            } else {

                this.mensagemErro.push('Erro inesperado.');
            }

            this.carregando = false;

            this.cdr.detectChanges();
        });

    }
}
