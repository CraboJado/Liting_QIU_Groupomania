
const getMysqlDate = ()=>{
    const createDate = new Date(Date.now());
    const mysqlDate = `${createDate.getFullYear()}-${createDate.getMonth()+1}-${createDate.getDate()} ${createDate.getHours()}:${createDate.getMinutes()}:${createDate.getSeconds()}`;
    return mysqlDate
}

module.exports = getMysqlDate;