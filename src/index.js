import {colors, mapping} from "./config.js";

import fmGofer from "fm-gofer";

// import {scheduler} from "bundle-text:/src/scheduler/codebase/scheduler.js";
// import {webix} from "bundle-text:/src/webix/codebase/webix.js";

// window.loadCalendar = function () {

window.loadSchedule = (json) => {
  const obj = JSON.parse(json);
  const width = obj.width;
  console.log("width", width)
class CustomBarsView extends scheduler.views['bars/nav'] {
  config() {
    const ui = super.config();
    ui.width = 100;
      ui.options = [
          { id: 'timeline', value: 'Work Load' },
      ];
      return ui;
  }
}
class CustomHours extends scheduler.views["modes/common/hourscale"] {
  config() {
    const ui = super.config();
    ui.type.height = 520;
    return ui;
  }
  ParseHours() {
    const data = [];
    for (let h = 0; h < 24; h++) {
      if (h > 7 && h < 22) data.push({ id: h + "" });
    }
    this.List.parse(data);
  }
}
class CustomBarView extends scheduler.views["modes/timeline/bar"] {
  config() {
    const ui = super.config();
    const rich = ui.elements[1];
    console.log("RICH", rich)
    rich.options.push({ id: "quarter", value: "Quarter" });
    rich.options = rich.options.filter((item) => item.id !== "day");
    return ui;
  }
}
class CustomTimelineView extends scheduler.views["modes/timeline"] {
  GetScalesArray(type) {
    if (type === "quarter") return [{ unit: "month", format: "%F %Y" }];
    return super.GetScalesArray(type);
  }

  GetScalesCellWidth(type) {
    if (type === "quarter") return 500;
    return super.GetScalesCellWidth(type);
  }
}

class MyBackend extends scheduler.services.Backend {
  // sections() {
  //   return sections
  // }
    async addEvent(event) {
      const action = "add";
      const obj = {action, event};
      const result = await fmGofer.PerformScript("HandleEvents", JSON.stringify(obj));
      return result;
    }
    async updateEvent(id, newData) { 
      const action = "update";
      const obj = {action, id, newData};
      const result = await fmGofer.PerformScript("HandleEvents", obj);
      console.log(result)
      return result;
    }
    // const sections = { id: 1, text: "Section 1" };

    async events() {
      const action = "get";
      const obj = {action}
      const result = await fmGofer.PerformScript("HandleEvents", JSON.stringify(obj));
      console.log("RESULT",result);
      const events = JSON.parse(result);
      console.log(events[0])
      const newEvents = events.map((event) => {
        const keys = Object.keys(event.fieldData);
        const newEvent = {}
        
        keys.forEach((key) => {
          const newKey = mapping[key]
          if (newKey) {
            newEvent[newKey] = event.fieldData[key]
          }
          if (newKey === "start_date") {
            newEvent.start_date = new Date(event.fieldData[key])
            newEvent.end_date = new Date(event.fieldData[key])
           
            // newEvent.text = newEvent.details || "No Details";
            newEvent.color = colors[event.fieldData._kf_StatusID] || "#000000";
            newEvent.all_day= 1
          }
          })
          return newEvent
      })
      console.log(newEvents)
      return newEvents;
    }
    async calendars() {
      const action = "getCalendars";
      const obj = {action}
      const result = await fmGofer.PerformScript("HandleEvents",JSON.stringify(obj));
      return JSON.parse(result);
    }
    async units() {
      const action = "getUnits";
      const obj = {action}
      const result = await fmGofer.PerformScript("HandleEvents",JSON.stringify(obj));
      return JSON.parse(result);
  }
  async sections() {
      const action = "getSections";
      const obj = {action}
      const result = await fmGofer.PerformScript("HandleEvents",JSON.stringify(obj));
      return JSON.parse(result);
    }
  }

  webix.CustomScroll.init();
  const mySched = webix.ui({
    view: "scheduler",
    calendars:true,
    day:true,
    timeline:true,
    url: "http://localhost:1234/",
    override: new Map([
      [scheduler.services.Backend, MyBackend],
      [scheduler.views["modes/common/hourscale"], CustomHours],
     
      [scheduler.views["modes/timeline/bar"], CustomBarView],
      [scheduler.views["modes/timeline"], CustomTimelineView],
    ]),
  });
  // mySched.define("width", width)
  
}