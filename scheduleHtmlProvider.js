function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    //除函数名外都可编辑
    //以下为示例，您可以完全重写或在此基础上更改
    let ans = '';
    const t = dom.getElementsByClassName('card-content-info');
    for(let i = 0; i < t.length; i++) {
        let s = t[i].innerText;
        s = s.replaceAll('&nbsp;',' ');
        s = s.replaceAll('\u000a',' ');
        ans = ans+s;
        if(i+1 < t.length) ans = ans + '|';
    }
    ans = '<div>' + ans + '</div>'
    return ans;
}