

export const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    // (?=.*[A-Z]): Ensures at least one uppercase letter.
    // (?=.*[0-9]): Ensures at least one digit.
    // (?=.*[!@#$%^&*]): Ensures at least one special character.
    // [A-Za-z\d!@#$%^&*]{8,}: Ensures the total length is 8 or more characters.
