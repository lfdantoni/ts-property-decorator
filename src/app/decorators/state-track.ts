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
      let store;



      Object.defineProperty(target, key, {
        configurable: false,
        enumerable: false,
        get: function() {
          return stateChange;
        },
        set: function(subject) {
          stateChange = subject;

          import('redux').then(mod => {
            const {createStore} = mod;

            store = createStore(
              (state: any = {}, action: any) => ( {...action.payload} ),
              (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
            );

            stateChange
              .subscribe(({stateType, state}) => {
                const stateStr: string = stateTypes ? stateTypes[stateType] : stateType.toString();

                stateTrackUtils.logState(stateType, state);

                store.dispatch({type: stateStr, payload: state});
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
