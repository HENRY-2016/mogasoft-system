




export const formatCreatedAtDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',    // "Mar"
        day: '2-digit',   // "02"
        year: 'numeric'    // "2025"
    });
};


export const formatNumberWithComma = (numb) => {
    let str = numb.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
}















export const convertToUpperCase = (Name) =>{
    return Name.toUpperCase();
}

export const clearLocalStorageData = () =>{
    sessionStorage.removeItem('reseacher');
    sessionStorage.removeItem('UserResearch');
    sessionStorage.removeItem('reduxState');
}
export const getIdFullName=(ID,Data)=>{
    let Name = ' ';
    // console.log("DATA"+JSON.stringify(Data))
    // console.log("ID"+ ID);
    let Id = parseInt(ID) ;
    Data.map((item,index)=>{if (item.id === Id){Name = item.full_name;}})
    return Name.toUpperCase();
}


export const getIdCategory=(ID,Data)=>{
    let Name = ' ';
    let Id =  parseInt(ID) ;
    Data.map((item,index)=>{if (item.id === Id){Name = item.name;}})
    return Name.toUpperCase();
}


export const getTodaysDate = ()=>{
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${month}/${day}/${year}`;
    // console.log(formattedDate); // Outputs: MM/DD/YYYY
    return formattedDate;
};


export const getCurrentUserId = () =>{
    const user = sessionStorage.getItem('reseacher');
    let userId = " ";
        if (user) {
            const jsonData = JSON.parse(user)
            userId = jsonData.id;
        }
    return parseInt(userId);
}

export const daysPassed = (givenDate) => {
    // Get the current date
    const currentDate = new Date();

    // Parse the given date (MM/DD/YYYY format)
    const startDate = new Date(givenDate);

    // Check if the given date is valid
    if (isNaN(startDate.getTime())) {
        console.error('Invalid date format. Please provide a valid date.');
        return;
    }

    // Calculate the difference in milliseconds
    const differenceInTime = currentDate - startDate;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    return differenceInDays;
}



export const parseResearchField = (fieldData) => {
    if (!fieldData) return '';

    try {
        const parsed = JSON.parse(fieldData);
        if (Array.isArray(parsed)) {
        return parsed
            .map(item => item.data || '')
            .filter(text => text.trim().length > 0)
            .join(' ');
        } else if (typeof parsed === 'string') {
        return parsed;
        } else if (parsed && typeof parsed === 'object') {
        return parsed.data || '';
        }
        return '';
    } catch (error) {
        // If JSON parsing fails, return as plain string
        return typeof fieldData === 'string' ? fieldData : '';
    }
};

export const getTruncatedText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};



    // Session Storage Keys
export const STORAGE_KEYS = {
        USER_ONLY: 'userOnly',
        USER_ID: 'userId'
    };

export const manageUserFilters = (userOnly, userId) => {
    if (userOnly && userId) {
        sessionStorage.setItem(STORAGE_KEYS.USER_ONLY, JSON.stringify(userOnly));
        sessionStorage.setItem(STORAGE_KEYS.USER_ID, JSON.stringify(userId));
    } else {
        sessionStorage.removeItem(STORAGE_KEYS.USER_ONLY);
        sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
    }
};
export const clearUserFilters = () => {
    manageUserFilters(false, null);
};















