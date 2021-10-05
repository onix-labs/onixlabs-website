import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdamComponent } from './pages/contributors/adam/adam.component';
import { LauraComponent } from './pages/contributors/laura/laura.component';
import { MattComponent } from './pages/contributors/matt/matt.component';
import { RyanComponent } from './pages/contributors/ryan/ryan.component';
import { IndexComponent } from './pages/index/index.component';
import { CordaBnmsComponent } from './pages/solutions/corda-bnms/corda-bnms.component';
import { CordaCoreComponent } from './pages/solutions/corda-core/corda-core.component';
import { CordaIdfxComponent } from './pages/solutions/corda-idfx/corda-idfx.component';
import { KotlinCoreComponent } from './pages/solutions/kotlin-core/kotlin-core.component';
import { KotlinProjectionComponent } from './pages/solutions/kotlin-projection/kotlin-projection.component';
import { KotlinValidationComponent } from './pages/solutions/kotlin-validation/kotlin-validation.component';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'contributors/matt', component: MattComponent },
  { path: 'contributors/laura', component: LauraComponent },
  { path: 'contributors/adam', component: AdamComponent },
  { path: 'contributors/ryan', component: RyanComponent },
  { path: 'solutions/corda-core', component: CordaCoreComponent },
  { path: 'solutions/corda-idfx', component: CordaIdfxComponent },
  { path: 'solutions/corda-bnms', component: CordaBnmsComponent },
  { path: 'solutions/kotlin-core', component: KotlinCoreComponent },
  { path: 'solutions/kotlin-validation', component: KotlinValidationComponent },
  { path: 'solutions/kotlin-projection', component: KotlinProjectionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
