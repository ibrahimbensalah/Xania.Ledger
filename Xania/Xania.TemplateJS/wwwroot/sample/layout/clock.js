"use strict";
var observables_1 = require("../../src/observables");
var xania_1 = require("../../src/xania");
var ClockApp = (function () {
    function ClockApp() {
        this.time = new observables_1.Observables.Time();
    }
    ClockApp.secondsAngle = function (time) {
        var f = 4;
        return 360 * (Math.floor(time / (1000 / f)) % (60 * f)) / (60 * f);
    };
    ClockApp.minutesAngle = function (time) {
        var f = 60 * 60 * 1000;
        return 360 * (time % f) / f;
    };
    ClockApp.hoursAngle = function (time) {
        var f = 12 * 60 * 60 * 1000;
        return 360 * (time % f) / f;
    };
    ClockApp.prototype.render = function () {
        return (xania_1.Xania.tag("div", { style: "height: 200px;" },
            xania_1.Xania.tag("svg", { viewBox: "0 0 200 200" },
                xania_1.Xania.tag("g", { transform: "scale(2) translate(50,50)" },
                    xania_1.Xania.tag("circle", { className: "clock-face", r: "35" }),
                    xania_1.Xania.tag(xania_1.ForEach, { expr: xania_1.fs("for p in [ 0..59 ]") },
                        xania_1.Xania.tag("line", { className: "minor", y1: "42", y2: "45", transform: ["rotate(", xania_1.fs("p * 6"), ")"] })),
                    xania_1.Xania.tag(xania_1.ForEach, { expr: xania_1.fs("for p in [ 0..11 ]") },
                        xania_1.Xania.tag("line", { className: "major", y1: "35", y2: "45", transform: ["rotate(", xania_1.fs("p * 30"), ")"] })),
                    xania_1.Xania.tag("line", { className: "hour", y1: "2", y2: "-20", transform: ["rotate(", xania_1.fs("hoursAngle (await time)"), ")"] }),
                    xania_1.Xania.tag("line", { className: "minute", y1: "4", y2: "-30", transform: ["rotate(", xania_1.fs("minutesAngle (await time)"), ")"] }),
                    xania_1.Xania.tag("g", { transform: ["rotate(", xania_1.fs("secondsAngle (await time)"), ")"] },
                        xania_1.Xania.tag("line", { className: "second", y1: "10", y2: "-38" }),
                        xania_1.Xania.tag("line", { className: "second-counterweight", y1: "10", y2: "2" }))))));
    };
    return ClockApp;
}());
exports.ClockApp = ClockApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zYW1wbGUvbGF5b3V0L2Nsb2NrLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscURBQW1EO0FBQ25ELHlDQUFvRDtBQUVwRDtJQUFBO1FBQ0ksU0FBSSxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQXdDbEMsQ0FBQztJQXRDVSxxQkFBWSxHQUFuQixVQUFvQixJQUFJO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVNLHFCQUFZLEdBQW5CLFVBQW9CLElBQUk7UUFDcEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLG1CQUFVLEdBQWpCLFVBQWtCLElBQUk7UUFDbEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCx5QkFBTSxHQUFOO1FBQ0ksTUFBTSxDQUFDLENBQ0gsMkJBQUssS0FBSyxFQUFDLGdCQUFnQjtZQUN2QiwyQkFBSyxPQUFPLEVBQUMsYUFBYTtnQkFDdEIseUJBQUcsU0FBUyxFQUFDLDJCQUEyQjtvQkFDcEMsOEJBQVEsU0FBUyxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsSUFBSSxHQUFVO29CQUMvQyxrQkFBQyxlQUFPLElBQUMsSUFBSSxFQUFFLFVBQUUsQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDbkMsNEJBQU0sU0FBUyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUM5RTtvQkFDVixrQkFBQyxlQUFPLElBQUMsSUFBSSxFQUFFLFVBQUUsQ0FBQyxvQkFBb0IsQ0FBQzt3QkFDbkMsNEJBQU0sU0FBUyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBSSxDQUMvRTtvQkFDViw0QkFBTSxTQUFTLEVBQUMsTUFBTSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLEtBQUssRUFBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBRSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUk7b0JBQ3JHLDRCQUFNLFNBQVMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsS0FBSyxFQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFFLENBQUMsMkJBQTJCLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBSTtvQkFDekcseUJBQUcsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLEdBQUcsQ0FBQzt3QkFDM0QsNEJBQU0sU0FBUyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxLQUFLLEdBQVE7d0JBQ2pELDRCQUFNLFNBQVMsRUFBQyxzQkFBc0IsRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxHQUFHLEdBQVEsQ0FDN0QsQ0FDSixDQUNGLENBQ0osQ0FDVCxDQUFDO0lBQ04sQ0FBQztJQUNMLGVBQUM7QUFBRCxDQUFDLEFBekNELElBeUNDO0FBekNZLDRCQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZXMgfSBmcm9tIFwiLi4vLi4vc3JjL29ic2VydmFibGVzXCJcclxuaW1wb3J0IHsgWGFuaWEsIEZvckVhY2gsIGZzIH0gZnJvbSBcIi4uLy4uL3NyYy94YW5pYVwiXHJcblxyXG5leHBvcnQgY2xhc3MgQ2xvY2tBcHAge1xyXG4gICAgdGltZSA9IG5ldyBPYnNlcnZhYmxlcy5UaW1lKCk7XHJcblxyXG4gICAgc3RhdGljIHNlY29uZHNBbmdsZSh0aW1lKSB7XHJcbiAgICAgICAgdmFyIGYgPSA0O1xyXG4gICAgICAgIHJldHVybiAzNjAgKiAoTWF0aC5mbG9vcih0aW1lIC8gKDEwMDAgLyBmKSkgJSAoNjAgKiBmKSkgLyAoNjAgKiBmKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbWludXRlc0FuZ2xlKHRpbWUpIHtcclxuICAgICAgICB2YXIgZiA9IDYwICogNjAgKiAxMDAwO1xyXG4gICAgICAgIHJldHVybiAzNjAgKiAodGltZSAlIGYpIC8gZjtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaG91cnNBbmdsZSh0aW1lKSB7XHJcbiAgICAgICAgdmFyIGYgPSAxMiAqIDYwICogNjAgKiAxMDAwO1xyXG4gICAgICAgIHJldHVybiAzNjAgKiAodGltZSAlIGYpIC8gZjtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cImhlaWdodDogMjAwcHg7XCI+XHJcbiAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT1cInNjYWxlKDIpIHRyYW5zbGF0ZSg1MCw1MClcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjbGFzc05hbWU9XCJjbG9jay1mYWNlXCIgcj1cIjM1XCI+PC9jaXJjbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JFYWNoIGV4cHI9e2ZzKFwiZm9yIHAgaW4gWyAwLi41OSBdXCIpfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5lIGNsYXNzTmFtZT1cIm1pbm9yXCIgeTE9XCI0MlwiIHkyPVwiNDVcIiB0cmFuc2Zvcm09e1tcInJvdGF0ZShcIiwgZnMoXCJwICogNlwiKSwgXCIpXCJdfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L0ZvckVhY2g+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JFYWNoIGV4cHI9e2ZzKFwiZm9yIHAgaW4gWyAwLi4xMSBdXCIpfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5lIGNsYXNzTmFtZT1cIm1ham9yXCIgeTE9XCIzNVwiIHkyPVwiNDVcIiB0cmFuc2Zvcm09e1tcInJvdGF0ZShcIiwgZnMoXCJwICogMzBcIiksIFwiKVwiXX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Gb3JFYWNoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluZSBjbGFzc05hbWU9XCJob3VyXCIgeTE9XCIyXCIgeTI9XCItMjBcIiB0cmFuc2Zvcm09e1tcInJvdGF0ZShcIiwgZnMoXCJob3Vyc0FuZ2xlIChhd2FpdCB0aW1lKVwiKSwgXCIpXCJdfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluZSBjbGFzc05hbWU9XCJtaW51dGVcIiB5MT1cIjRcIiB5Mj1cIi0zMFwiIHRyYW5zZm9ybT17W1wicm90YXRlKFwiLCBmcyhcIm1pbnV0ZXNBbmdsZSAoYXdhaXQgdGltZSlcIiksIFwiKVwiXX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPXtbXCJyb3RhdGUoXCIsIGZzKFwic2Vjb25kc0FuZ2xlIChhd2FpdCB0aW1lKVwiKSwgXCIpXCJdfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5lIGNsYXNzTmFtZT1cInNlY29uZFwiIHkxPVwiMTBcIiB5Mj1cIi0zOFwiPjwvbGluZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5lIGNsYXNzTmFtZT1cInNlY29uZC1jb3VudGVyd2VpZ2h0XCIgeTE9XCIxMFwiIHkyPVwiMlwiPjwvbGluZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9nPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZz5cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=