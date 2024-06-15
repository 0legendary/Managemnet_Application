const validateEmail = (email) => {
    const condition = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return condition.test(email);
};

const validatePassword = (password) => {
    const condition = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return condition.test(password);
};

const loginAuthenticate = (email, password) => {
    const newErrors = {};
    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }
    if (!password) {
        newErrors.password = 'Password is required.';
    }
    return newErrors
}

const signUpAuthenticate = (username, email, password, confirmPassword) => {
    const newErrors = {};
    if (!username) {
        newErrors.username = 'Username is required.';
    } else if (username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters long.';
    }

    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }

    if (!password) {
        newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
        newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors
}

const updateUserAuthenticate = async (username, email, password, confirmPassword, changes) => {
    console.log(changes);
    const newErrors = {};
    if (changes.username === username &&
        changes.email === email &&
        changes.newPassword === password &&
        changes.confirmPassword === confirmPassword
    ) {
        console.log('nothing changed');
        newErrors.changes = 'Need to change something to save'
    }
    if (!username) {
        newErrors.username = 'Username is required.';
    } else if (username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters long.';
    }

    if (!email) {
        newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format.';
    }

    if (password !== '') {
        if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
        }
        else if (password !== confirmPassword) {
            newErrors.notMatching = 'Passwords do not match'
        }
    }

    if(confirmPassword !== ''){
        if (password === '') {
            newErrors.notFilledPassword = 'Enter the new password'
        }
    }
    return newErrors
}



export { loginAuthenticate, signUpAuthenticate, updateUserAuthenticate }