const {
    certificateTypeEnt,
    courseNameEnt,
    sarvaStudentFeeEnt,
    monthNamesEnt,
    courseFeeBDK,
    courseFeeKJR
} = require('./entities');

const getSarvaFee = (course, duration, certType, joinDate) => {
    if (certType === certificateTypeEnt.regular) {
        if (course === courseNameEnt.pgdca) {
            return sarvaStudentFeeEnt.pgdca;
        } else {
            return sarvaStudentFeeEnt[duration];
        }
    } else if (certType === certificateTypeEnt.urgent) {
        const joinYear = new Date(joinDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const durationGap = currentYear - joinYear;
        const durationGapUrg = durationGap > 0 ? durationGap+1 : durationGap+2
        if (course === courseNameEnt.pgdca) {
            return sarvaStudentFeeEnt.pgdca * durationGapUrg;
        } else {
            return sarvaStudentFeeEnt[duration] * durationGapUrg;
        }
    }
}

const getSarvaSession = (duration, joinDate) => {
    const monthDuration = Number(duration.replace('M', ''));
    const joinDt = new Date(joinDate);
    const joinMonth = joinDt.getMonth();
    const joinMonthName = monthNamesEnt[joinMonth];
    const joinYear = joinDt.getFullYear();
    
    const validDtNumFormat = joinDt.setMonth(joinMonth+monthDuration);
    const validDt = new Date(validDtNumFormat);
    const validMonth = validDt.getMonth();
    const validMonthName = monthNamesEnt[validMonth];
    const validYear = validDt.getFullYear();
    const validDateISOStr = validDt.toISOString();

    const sarvaSessionData = {
        sarvaSession: `${joinMonthName} ${joinYear} - ${validMonthName} ${validYear}`,
        validTillDate: validDateISOStr
    }

    return sarvaSessionData;
};

const getCourseFee = (course, branch, discount) => {
    let courseFee;
    if (branch === 'BDK') {
        courseFee = courseFeeBDK[course];
    } else if (branch === 'KJR') {
        courseFee = courseFeeKJR[course];
    }

    return courseFee;
}

const getBranchLocation = (userRole) => {
    if (userRole === 'JIIT_BDK_ADMIN' || userRole === 'JIIT_BDK_SUPERVISOR') {
        return 'BDK';
    }

    if (userRole === 'JIIT_KJR_ADMIN' || userRole === 'JIIT_KJR_SUPERVISOR') {
        return 'KJR';
    }

    return '';
}


module.exports = {
    getSarvaFee,
    getSarvaSession,
    getCourseFee,
    getBranchLocation
}
