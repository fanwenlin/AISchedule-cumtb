function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
    //以下为示例，您可以完全重写或在此基础上更改

//     let container = $("p.card-content-info");
    let container = html.substr(5,html.length-11);
    container = container.split('|');
    let result = [];
    for (let u = 0; u < container.length; u++) {
        let re = {};
        let aaa = container[u];


        let text = aaa;
        aaa = text.split(/\s+/);
        let cur = 0;
        re.name = aaa[cur++];
        if(aaa[cur][0] == '(') re.position = "未知";
        else re.position = aaa[cur++];


        //TODO: 解析teacher
        re.teacher = "张三";

        re.weeks = [];
        let weeks_text = aaa[cur].substr(1,aaa[cur].length-3);
        let weeks_list = weeks_text.split(',');
        for(let it = 0; it < weeks_list.length; it++) {
            let week_str = weeks_list[it];
            if(week_str.match('~') == null) {
                re.weeks.push(Number(week_str));
            }
            else{
                let begin = week_str.split('~')[0];
                let end = week_str.split('~')[1];
                for(let wk = Number(begin); wk <= Number(end); wk++) {
                    re.weeks.push(wk);
                }
            }
        }
        cur++;

        re.day = Number(aaa[cur++]);

        re.sections = [];
        let sections_text = aaa[cur++];
        sections_text = sections_text.substr(1,sections_text.length-2);
        let sections = sections_text.split(',');
        for(let it = 0; it < sections.length; it++) {
            re.sections.push({'section':Number(sections[it])});
        }
        result.push(re);
    }
    let ret = { courseInfos: result };
    return ret;
}