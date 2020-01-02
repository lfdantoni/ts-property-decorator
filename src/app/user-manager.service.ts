import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { stateTrack } from './decorators/state-track';

export enum UserState {
  INIT_STATE,
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_FAIL
}

export class User {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {

  @stateTrack({StateEnums: UserState})
  stateChange = new BehaviorSubject<{stateType: UserState, state: User}>({
    stateType: UserState.INIT_STATE,
    state: this.getInitState()
  });

  constructor() { }

  getUser() {
    this.updateState(UserState.GET_USER, this.getInitState());

    setTimeout(
      () => this.updateState(UserState.GET_USER_SUCCESS, {email: 'test@test.com', name: 'test'}) ,
      5000);
  }

  getState(): User {
    return {...this.stateChange.getValue().state}
  }

  private updateState(stateType: UserState, state: User = this.getState()) {
    this.stateChange.next({stateType, state});
  }

  private getInitState(): User {
    return {
      email: '',
      name: ''
    };
  }
}
