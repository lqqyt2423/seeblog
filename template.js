'use strict';

class Template {

  constructor(template) {
    this.template = template;
  }

  render(params) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      throw new Error('传入的参数必须为对象');
    }

    const keys = Object.keys(params);
    let html = this.template;
    keys.forEach(key => {
      const pattern = new RegExp(`<%=\\s${key}\\s%>`, 'ig');
      html = html.replace(pattern, params[key]);
    });
    // 替换掉剩余未转换的标记
    html = html.replace(/<%=\s.+?\s%>/gi, '');
    return html;
  }

}

module.exports = Template;
