import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetrospectiveLandingPageComponent } from './pages/retrospective-landing/retrospective-landing-page.component';
import { RetrospectiveBoardPageComponent } from './pages/retrospective-board/retrospective-board-page.component';

const routes: Routes = [
  {
    path: '',
    component: RetrospectiveLandingPageComponent,
    data: { title: 'Retrospective Boards' }
  },
  {
    path: 'board/:id',
    component: RetrospectiveBoardPageComponent,
    data: { title: 'Retrospective Board' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RetrospectiveRoutingModule { }