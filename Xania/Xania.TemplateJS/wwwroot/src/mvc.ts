﻿import { Observables } from "./observables"

export class UrlHelper {
    public observers = [];
    public actionPath: Observables.Observable<string>;
    private initialPath: string;

    constructor(private appPath, actionPath, private appInstance) {
        this.actionPath = new Observables.Observable<string>(actionPath);
        this.initialPath = actionPath;

        window.onpopstate = (popStateEvent) => {
            var { state } = popStateEvent;
            var actionPath = state ? state.actionPath : this.initialPath;
            if (actionPath !== this.actionPath.current)
                this.actionPath.notify(actionPath);
        }
    }

    action(path: string, view?) {
        return (event) => {
            var actionPath = path;
            var actionView = view;
            if (this.actionPath.current !== actionPath) {
                var action = { actionPath, actionView };
                window.history.pushState(action, "", this.appPath + "/" + actionPath);
                this.actionPath.notify(actionPath);
            }
            event.preventDefault();
        };
    }
}

export class HtmlHelper {

    constructor(private loader: { import(path: string); }) {

    }

    partial(viewPath: string) {
        var view = this.loader.import(viewPath);
        return {
            bind(visitor) {
                return new ViewBinding(visitor, view, {});
            }
        }
    }
}

class ViewBinding {
    private binding;
    private cancellationToken: number;

    constructor(private visitor, private view, private model) {
    }

    update(context, parent) {

        if (!this.view)
            throw new Error("view is empty");

        var cancellationToken = Math.random();
        this.cancellationToken = cancellationToken;
        this.view.then(app => {
            if (cancellationToken === this.cancellationToken) {
                this.dispose();
                this.binding = app.bind(context, parent);
            }
        });
    }

    dispose() {
        if (this.binding) {
            this.binding.dispose();
        }
    }
}

export interface IDriver {
    
}

export class ViewResult {
    constructor(private view, private model?) { }

    execute(driver: IDriver, visitor) {
        var binding = this.view.bind(visitor);
        return binding.update(this.model, driver);
    }
}
