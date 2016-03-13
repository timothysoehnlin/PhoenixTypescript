import {Base} from '../base';

export default class Classifier extends Base {
  static id:number = 0;
  static toRegExp(o):RegExp {
    return o instanceof RegExp ? o : new RegExp('^'+o+'.*$', 'i')
  } 
  static parse(target:string, config:ClassificationExternal[]):Classification[] {
  
    return config.map(x => {
      let o:Classification = { id : `${++Classifier.id}`, target };
      if (typeof x === 'string') {
        o.app = Classifier.toRegExp(x);
      } else {        
        ['app','window','windowNot'].forEach(p => {
          if (x[p]) o[p] = Classifier.toRegExp(x[p]);             
        });
        ['tile'].forEach(p => {
          if (x[p]) o[p] = x[p];
        });
      }
      return o;
    })
  }
  
  classes:Named<Classification[]> = {}
  classesMap:Named<Classification> = {}
  
  constructor(classes:Named<ClassificationExternal[]>) {
    super()
    this.classes = Object.map(classes, (x,target) => Classifier.parse(target, x));
    Object.forEach(this.classes, (cls:Classification[], name) => 
      cls.map(c => this.classesMap[c.id] = c)
    )
  }
  
  classify(w:Window):Classification {
    let app = w.app().name();
    let window = w.title();
      
    for (let k in this.classes) {
        
      let found = this.classes[k].find(cls => {
        return !((cls.app && !cls.app.test(app)) 
          || (cls.window && !cls.window.test(window)) 
          || (cls.windowNot && cls.windowNot.test(window)));
      });
      
      if (found) {
        this.notify(`Mapping for: ${app} - ${window} - ${found.target}`)      
        return found;
      }
    }
    
    this.notify(`No mapping for: ${app} - ${window}`)
  }  
}