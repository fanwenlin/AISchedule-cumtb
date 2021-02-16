function getSemesterId(dom,default_value = 121) {

    let ret = default_value;
    try{
        console.log("debug")
        optionList = dom.querySelector("#allSemesters").childNodes;

        console.log(optionList);
        for(x in optionList) {
            x = optionList[x]
            console.log(x)
            try{
                if(x.getAttribute("selected") === "selected"){
                    console.log(x.getAttribute("value"));
                    ret = parseInt(x.getAttribute("value"))
                }
            }
            catch{
                continue;
            }
        }
    }
    catch(error){
        console.info(error);
        return ret;
    }
    return ret;
}
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    let message = `获取课表的方式改为模拟HTTP请求，登入系统后就可以一键导入
    update: 支持了对学期变化的跟踪\n
（代码已经上传至github，欢迎一同维护
https://github.com/fanwenlin/AISchedule-cumtb）`;
    if(message.length > 0 ) alert(message);
    let xmlhttp=null;
    let lessonIds = [];
    let lessons = [];
    let lessonid2coursename = {};
    let lessonid2teacher = {};
    let time2sectionid = {};
    let sections = {};
    let ret = null;
    let semesterId = 121;

    if (window.XMLHttpRequest) {// code for all new browsers
        xmlhttp = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {// code for IE5 and IE6
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if(xmlhttp != null) {

        // xmlhttp.onreadystatechange= function () {
        //     if(xmlhttp.readyState == 4) {
        //         if(xmlhttp.status == 200) {
        //             // retrieve XML data
        //             ret = xmlhttp.responseXML;
        //         }
        //         else {
        //             alert("Problem retrieving XML data.");
        //         }
        //     }
        // };
        semesterId = getSemesterId(dom,-1);

        console.log("SemesterId:" + semesterId);
        url = "https://jwxt.cumtb.edu.cn/student/for-std/course-table"
        if(semesterId==-1) {
            node = dom.createElement("html");
            xmlhttp.open("GET",url,false);
            xmlhttp.send(null);
            node.innerHTML = xmlhttp.responseText
            semesterId = getSemesterId(node,121)
        }
        console.log("SemesterId:" + semesterId);
        url = "https://jwxt.cumtb.edu.cn/student/for-std/course-table/get-data?bizTypeId=2&semesterId="+semesterId;
        xmlhttp.open("GET", url, false);
        xmlhttp.send(null);
        resp = JSON.parse(xmlhttp.responseText);
        console.log(resp);
        lessonIds = resp["lessonIds"];
        lessons = resp["lessons"];
        for(let id = 0; id < lessons.length; id++) {
            let current_lesson = lessons[id];
            let lesson_id = current_lesson['id'];
            let lesson_teacherlist = [];
            let lesson_name = current_lesson['course']['nameZh'];
            let lesson_teacherAssignmentList = current_lesson['teacherAssignmentList'];
            for(let teacherIterator = 0; teacherIterator < lesson_teacherAssignmentList.length; teacherIterator++) {
                lesson_teacherlist.push(lesson_teacherAssignmentList[teacherIterator]['person']['nameZh']);
            }
            lessonid2coursename[lesson_id] = lesson_name;
            lessonid2teacher[lesson_id] = lesson_teacherlist.length == 0 ? "未知" : lesson_teacherlist.join(',');
        }

        // {"timeTableLayoutId":21}
        url = "https://jwxt.cumtb.edu.cn/student/ws/schedule-table/timetable-layout";
        xmlhttp.open("POST", url, false);
        xmlhttp.setRequestHeader("Content-Type","application/json");
        xmlhttp.send(JSON.stringify({"timeTableLayoutId":21}));
        resp = JSON.parse(xmlhttp.responseText);
        let courseunitlist = resp['result']['courseUnitList'];
        for(let it = 0; it < courseunitlist.length; it++) {
            let courseunit = courseunitlist[it];
            let index = courseunit['indexNo'];
            let ST = courseunit['startTime'], ET = courseunit['endTime'];
            time2sectionid[ST] = index;
            ST = (Math.floor(ST/100).toString() < 10 ? '0'+Math.floor(ST/100).toString() : Math.floor(ST/100).toString()) + ':'
                + (ST%100 < 10 ? '0' + (ST%100).toString() : (ST%100).toString());
            ET = (Math.floor(ET/100).toString() < 10 ? '0' + Math.floor(ET/100).toString() : Math.floor(ET/100).toString()) + ':'
                + (ET%100 < 10 ? '0' + (ET%100).toString() : (ET%100).toString());
            sections[index] = {
                "section": index,
                "startTime": ST,
                "endTime": ET
            };
        }

        url = "https://jwxt.cumtb.edu.cn/student/ws/schedule-table/datum";
        xmlhttp.open("POST", url, false);
        xmlhttp.setRequestHeader("Content-Type","application/json");
        xmlhttp.send(JSON.stringify({"lessonIds":lessonIds,"studentId":null,"weekIndex":null}));
        resp = JSON.parse(xmlhttp.responseText);
        let scheduleList = resp['result']['scheduleList'];

        let courseInfos = [];

        for (let i = 0; i < scheduleList.length; i++) {
            schedule = scheduleList[i];
            let course = {};
            course['name'] = lessonid2coursename[schedule['lessonId']];
            course['teacher'] = lessonid2teacher[schedule['lessonId']];

            course['position'] = "";
            let pos = "";
            if(schedule['room'] != null) {
                pos = pos + schedule['room']['nameZh'];
                if(schedule['room']['building'] != null) {
                    pos = pos + ' ' + schedule['room']['building']['nameZh'];
                    if(schedule['room']['building']['campus'] != null) {
                        pos = pos + ' ' + schedule['room']['building']['campus']['nameZh'];
                    }
                }
            }
            course['position'] = pos;

            course['weeks'] = [schedule['weekIndex']];
            course['day'] = [schedule['weekday']];

            course['sections'] = [];
            let start_section = time2sectionid[ schedule['startTime'] ];
            let periods = schedule['periods'];
            for (let j = 0; j < periods; j++) {
                course['sections'].push(sections[start_section+j]);
            }

            courseInfos.push(course);
        }
        let ans = JSON.stringify({
            'courseInfos':courseInfos,
            'sectionTimes':sections
        });
        ans = '<div>' + ans + '</div>'
        return ans;
    }
    else {
        alert("Your browser does not support XMLHTTP.");
    }
    return ans;
}