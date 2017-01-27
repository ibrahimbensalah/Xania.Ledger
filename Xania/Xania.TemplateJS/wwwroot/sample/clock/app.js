"use strict";
var observables_1 = require("../../src/observables");
var dom_1 = require("../../src/dom");
var reactive_1 = require("../../src/reactive");
var ClockApp = (function () {
    function ClockApp() {
        this.time = new observables_1.Observables.Time();
        this.values = [1, 2, 3, 4, 5, 6, 7, 8];
    }
    ClockApp.shuffle = function (array) {
        var result = array.slice(0);
        var currentIndex = result.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = result[currentIndex];
            result[currentIndex] = result[randomIndex];
            result[randomIndex] = temporaryValue;
        }
        return result;
    };
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
    return ClockApp;
}());
function init(tpl, target) {
    var store = new reactive_1.Reactive.Store(new ClockApp());
    dom_1.Dom.parse(tpl).bind(target, store);
}
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc2FtcGxlL2Nsb2NrL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscURBQW1EO0FBQ25ELHFDQUFtQztBQUNuQywrQ0FBbUQ7QUFFbkQ7SUFBQTtRQUNJLFNBQUksR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFOUIsV0FBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBbUN0QyxDQUFDO0lBakNVLGdCQUFPLEdBQWQsVUFBZSxLQUFLO1FBQ2hCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDO1FBRzlELE9BQU8sQ0FBQyxLQUFLLFlBQVksRUFBRSxDQUFDO1lBR3hCLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUN2RCxZQUFZLElBQUksQ0FBQyxDQUFDO1lBR2xCLGNBQWMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsY0FBYyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxxQkFBWSxHQUFuQixVQUFvQixJQUFJO1FBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVNLHFCQUFZLEdBQW5CLFVBQW9CLElBQUk7UUFDcEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLG1CQUFVLEdBQWpCLFVBQWtCLElBQUk7UUFDbEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDTCxlQUFDO0FBQUQsQ0FBQyxBQXRDRCxJQXNDQztBQUVELGNBQXFCLEdBQUcsRUFBRSxNQUFNO0lBQzVCLElBQUksS0FBSyxHQUFHLElBQUksbUJBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBSEQsb0JBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPYnNlcnZhYmxlcyB9IGZyb20gXCIuLi8uLi9zcmMvb2JzZXJ2YWJsZXNcIlxyXG5pbXBvcnQgeyBEb20gfSBmcm9tIFwiLi4vLi4vc3JjL2RvbVwiXHJcbmltcG9ydCB7IFJlYWN0aXZlIGFzIFJlIH0gZnJvbSAnLi4vLi4vc3JjL3JlYWN0aXZlJ1xyXG5cclxuY2xhc3MgQ2xvY2tBcHAge1xyXG4gICAgdGltZSA9IG5ldyBPYnNlcnZhYmxlcy5UaW1lKCk7XHJcblxyXG4gICAgdmFsdWVzID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xyXG5cclxuICAgIHN0YXRpYyBzaHVmZmxlKGFycmF5KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFycmF5LnNsaWNlKDApO1xyXG4gICAgICAgIHZhciBjdXJyZW50SW5kZXggPSByZXN1bHQubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXg7XHJcblxyXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gcmVzdWx0W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgICAgIHJlc3VsdFtjdXJyZW50SW5kZXhdID0gcmVzdWx0W3JhbmRvbUluZGV4XTtcclxuICAgICAgICAgICAgcmVzdWx0W3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZWNvbmRzQW5nbGUodGltZSkge1xyXG4gICAgICAgIHZhciBmID0gNDtcclxuICAgICAgICByZXR1cm4gMzYwICogKE1hdGguZmxvb3IodGltZSAvICgxMDAwIC8gZikpICUgKDYwICogZikpIC8gKDYwICogZik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG1pbnV0ZXNBbmdsZSh0aW1lKSB7XHJcbiAgICAgICAgdmFyIGYgPSA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICByZXR1cm4gMzYwICogKHRpbWUgJSBmKSAvIGY7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGhvdXJzQW5nbGUodGltZSkge1xyXG4gICAgICAgIHZhciBmID0gMTIgKiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICByZXR1cm4gMzYwICogKHRpbWUgJSBmKSAvIGY7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0KHRwbCwgdGFyZ2V0KSB7XHJcbiAgICB2YXIgc3RvcmUgPSBuZXcgUmUuU3RvcmUobmV3IENsb2NrQXBwKCkpO1xyXG4gICAgRG9tLnBhcnNlKHRwbCkuYmluZCh0YXJnZXQsIHN0b3JlKTtcclxufVxyXG4iXX0=