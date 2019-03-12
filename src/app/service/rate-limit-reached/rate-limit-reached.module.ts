import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {RateLimitReached} from './rate-limit.reached';

@NgModule({
  imports: [MaterialModule, CommonModule],
  declarations: [RateLimitReached],
  exports: [RateLimitReached],
  entryComponents: [RateLimitReached],
})
export class RateLimitReachedModule {
}
