import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { IndexComponent } from './pages/index/index.component';
import { MastheadComponent } from './pages/index/masthead/masthead.component';
import { ValuesComponent } from './pages/index/values/values.component';
import { CordaSolutionsComponent } from './pages/index/corda-solutions/corda-solutions.component';
import { KotlinSolutionsComponent } from './pages/index/kotlin-solutions/kotlin-solutions.component';
import { ContributorsComponent } from './pages/index/contributors/contributors.component';
import { ContactComponent } from './pages/index/contact/contact.component';
import { MattComponent } from './pages/contributors/matt/matt.component';
import { LauraComponent } from './pages/contributors/laura/laura.component';
import { AdamComponent } from './pages/contributors/adam/adam.component';
import { RyanComponent } from './pages/contributors/ryan/ryan.component';
import { CordaCoreComponent } from './pages/solutions/corda-core/corda-core.component';
import { CordaIdfxComponent } from './pages/solutions/corda-idfx/corda-idfx.component';
import { CordaBnmsComponent } from './pages/solutions/corda-bnms/corda-bnms.component';
import { KotlinCoreComponent } from './pages/solutions/kotlin-core/kotlin-core.component';
import { KotlinValidationComponent } from './pages/solutions/kotlin-validation/kotlin-validation.component';
import { KotlinProjectionComponent } from './pages/solutions/kotlin-projection/kotlin-projection.component';


@NgModule({
  declarations: [
    LayoutComponent,
    IndexComponent,
    MastheadComponent,
    ValuesComponent,
    CordaSolutionsComponent,
    KotlinSolutionsComponent,
    ContributorsComponent,
    ContactComponent,
    MattComponent,
    LauraComponent,
    AdamComponent,
    RyanComponent,
    CordaCoreComponent,
    CordaIdfxComponent,
    CordaBnmsComponent,
    KotlinCoreComponent,
    KotlinValidationComponent,
    KotlinProjectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [LayoutComponent]
})
export class AppModule { }
