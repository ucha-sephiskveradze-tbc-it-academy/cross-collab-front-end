import { Component } from '@angular/core';
import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';

@Component({
  selector: 'app-notifications',
  imports: [Footer, Header],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {}
