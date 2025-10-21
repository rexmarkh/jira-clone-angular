import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';

// NG-ZORRO imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

// Routing
import { RetrospectiveRoutingModule } from './retrospective-routing.module';

// Components
import { RetrospectiveLandingPageComponent } from './pages/retrospective-landing/retrospective-landing-page.component';
import { RetrospectiveBoardPageComponent } from './pages/retrospective-board/retrospective-board-page.component';
import { StickyNoteComponent } from './components/sticky-note/sticky-note.component';
import { RetroColumnComponent } from './components/retro-column/retro-column.component';

// Services
import { RetrospectiveService } from './state/retrospective.service';
import { RetrospectiveStore } from './state/retrospective.store';
import { RetrospectiveQuery } from './state/retrospective.query';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TextFieldModule,
    RetrospectiveRoutingModule,
    
    // NG-ZORRO modules
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzEmptyModule,
    NzTagModule,
    NzStepsModule,
    NzSelectModule,
    NzToolTipModule,
    NzDividerModule,
    NzGridModule,
    NzPopoverModule,
    
    // Standalone components
    RetrospectiveLandingPageComponent,
    RetrospectiveBoardPageComponent,
    StickyNoteComponent,
    RetroColumnComponent
  ],
  providers: [
    RetrospectiveService,
    RetrospectiveStore,
    RetrospectiveQuery
  ]
})
export class RetrospectiveModule { }