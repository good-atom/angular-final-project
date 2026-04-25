import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

import { AuthService } from '../../core/auth/auth.service';
import { Establishment } from '../../core/models/cafe.models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TuiButton, TuiLoader],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly establishments = signal<Establishment[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    email: ['admin@cafe.local', [Validators.required, Validators.email]],
    password: ['demo1234', [Validators.required, Validators.minLength(4)]],
    establishmentId: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    this.establishments.set(await this.auth.establishments());
    this.form.controls.establishmentId.setValue(this.establishments()[0]?.id ?? '');
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password, establishmentId } = this.form.getRawValue();
      await this.auth.login(email, password, establishmentId);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Не удалось войти');
    } finally {
      this.loading.set(false);
    }
  }
}
