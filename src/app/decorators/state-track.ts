import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

class StateTrackOptions {
  StateEnums?: any;
  mode?: 'auto' | 'enable' | 'disabled';
  isProduction?: boolean;
}

const DEFAULT: StateTrackOptions = {
  mode: 'auto',
  isProduction: environment.production
};

export function stateTrack(options: StateTrackOptions = DEFAULT) {
  options = {
    ...DEFAULT,
    ...options
  };

  return (target: any, key: string) => {
    const stateTrackUtils = new StateTrackUtils(options);

    if (stateTrackUtils.enableTrack()) {
      let stateChange: BehaviorSubject<{stateType: any, state: any}>;
      const stateTypes = options.StateEnums;
      let store, dispatch = true;



      Object.defineProperty(target, key, {
        configurable: false,
        enumerable: false,
        get: function() {
          return stateChange;
        },
        set: function(subject) {
          stateChange = subject;

          import('redux').then(mod => {
            const {createStore, compose, applyMiddleware} = mod;

            const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

            const middleware = store => next => action => {
              let type = -1;
              let typeStr = '';

              if (typeof action.type === 'string') {
                type = stateTypes ?
                  stateTypes[action.type] as number :
                  action.type;
                typeStr = action.type;
              } else {
                type = action.type as number;
                typeStr = stateTypes[type];
              }

              if (action.payload.__updateProperty__ === undefined) {
                stateChange.next({stateType: type, state: action.payload});
              } else {
                delete action.payload.__updateProperty__;
                stateTrackUtils.logState(type, action.payload);
                const newAction = {
                  ...action,
                  type: typeStr
                };

                next(newAction);
              }
            };


            store = createStore(
              (state: any = {}, action: any) => {
                const nextState = {
                  ...state,
                  ...action.payload
                };
                return nextState;
              },
              composeEnhancers(
                applyMiddleware(middleware)
              )
            );

            stateChange
              .subscribe(({stateType, state}) => {
                store.dispatch({type: stateType, payload: {...state, __updateProperty__: false }});
              });
          });
        }
      });
    }

  };
}

class StateTrackUtils {
  constructor(private options: StateTrackOptions) { }

  enableTrack(): boolean {
    if (this.options.mode === 'auto' && !this.options.isProduction) {
      return true;
    }

    return this.options.mode === 'enable';
  }

  logState(stateType: any, state: any): void {
    console.group(`State Track ${new Date().toLocaleTimeString()}`);
    console.log('State Type: ', this.stateTypes ? this.stateTypes[stateType] : stateType);
    console.log('State Value: ', state);
    console.groupEnd();
  }

  get stateTypes() {
    return this.options.StateEnums;
  }
}
