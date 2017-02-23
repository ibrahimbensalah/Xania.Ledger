﻿import { Xania as xania, ForEach, fs, View, Dom, Reactive as Re, Template } from "../src/xania"
import { UrlHelper, ViewResult } from "../src/mvc"
import './admin.css'
import { Observables } from "../src/observables";
import { ClockApp } from '../sample/clock/app'
import { TodoApp } from "../sample/layout/todo";
import DataGrid from "./grid"

var time = new Observables.Time();
var store = new Re.Store({
    user: "Ibrahim",
    time,
    currentUser: {},
    saveUser() {
        console.log("save user", this.currentUser);
    }
});

export function index() {
    return new ViewResult(<div>index</div>, store);
}

export function menu({ driver, html, url }) {
    mainMenu(url).bind<Re.Binding>(Dom.DomVisitor)
        .update(new Re.Store({}), driver);
}

export function invoices() {
    return new ViewResult(<div>invoices {fs("user")}</div>, store);
}

var toggleTime = () => {
    time.toggle();
};

export function timesheet() {
    return new ViewResult(<div>timesheet {fs("await time")}
        <button onClick={toggleTime}>toggle time</button>
        <ClockApp time={time} />
    </div>, store);
}

export function todos() {
    return new ViewResult(<TodoApp />);
}

export function users() {
    var onCancel = () => {
        store.get("currentUser").set({});
        store.refresh();
    }
    return new ViewResult(
        <div style="height: 95%;" className="row">
            <div className={[fs("currentUser -> 'col-8'"), fs("not currentUser -> 'col-12'")]}>
                <section className="section" style="height: 100%">
                    <div style="padding: 0px 16px 100px 16px; height: 100%;">
                        <header style="height: 50px"><span className="fa fa-adjust"></span> <span>Users</span></header>
                        <DataGrid activeRecord={fs("currentUser")} />
                        <footer style="height: 50px; margin: 0 16px; padding: 0;"><button className="btn btn-primary" data-bind="click: users.create"><span className="glyphicon glyphicon-plus"></span> Add New</button></footer>
                    </div>
                </section>
            </div>
            <div className="col-4">
                <section className="section" style="height: 100%">
                    <button type="button" className="close" aria-hidden="true" style="margin: 16px 16px 0 0;" onClick={onCancel}>×</button>
                    <header style="height: 50px"><span className="fa fa-adjust"></span> <span>User</span></header>

                    <div style="padding: 0px 16px 100px 16px; height: 100%;">
                        <header style="height: 50px">
                            <span className="fa fa-adjust"></span>
                            <span>{fs("currentUser.Name")}</span>
                        </header>
                        <div className="col-lg-12 col-md-3"><label className="control-label" for="UserName">User name</label><div>
                            <input className="form-control" type="text" placeholder="User name" name="currentUser.Name" />
                        </div>
                        </div>
                        <div className="col-lg-12 col-md-3"><label className="control-label" for="Email">Email</label>
                            <div><input id="Email" className="form-control" type="text" placeholder="Email" name="currentUser.Email" /></div>
                        </div>
                        <div className="col-lg-12 col-md-3"><div>
                            <input type="checkbox" checked={fs("currentUser.EmailConfirmed")} /> <label className="control-label" for="EmailConfirmed">Email confirmed</label>
                        </div></div>
                        <div className="col-lg-12 col-md-3">
                            <button className="btn btn-primary" onClick={fs("saveUser ()")}>
                                <span className="fa fa-save"></span> Save</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>, store);
}

var MenuItem = ({name}) => <li><a href="http://www.google.nl">menu item {name}</a></li>;

var mainMenu: (url: UrlHelper) => Template.INode = (url: UrlHelper) =>
    <ul className="main-menu-ul">
        {["timesheet", "invoices", "todos", "users"].map(actionName => (
            <li className="main-menuitem">
                <a className="main-menuitem-link" href="" onClick={url.action(actionName)}>{actionName}</a>
            </li>))}
    </ul>;

var panel = n =>
    <section className="mdl-layout__tab-panel" id={"scroll-tab-" + n}>
        <div className="page-content">tab {n}</div>
    </section>;