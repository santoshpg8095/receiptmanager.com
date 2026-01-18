const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const convertLessThanThousand = (num) => {
    if (num === 0) return '';
    
    let result = '';
    
    if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }
    
    if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        num = 0;
    }
    
    if (num > 0) {
        result += ones[num] + ' ';
    }
    
    return result.trim();
};

const amountToWords = (amount) => {
    if (amount === 0) return 'Zero Rupees Only';
    
    let rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);
    
    let result = '';
    
    // Crores
    if (rupees >= 10000000) {
        result += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore ';
        rupees %= 10000000;
    }
    
    // Lakhs
    if (rupees >= 100000) {
        result += convertLessThanThousand(Math.floor(rupees / 100000)) + ' Lakh ';
        rupees %= 100000;
    }
    
    // Thousands
    if (rupees >= 1000) {
        result += convertLessThanThousand(Math.floor(rupees / 1000)) + ' Thousand ';
        rupees %= 1000;
    }
    
    // Hundreds
    if (rupees > 0) {
        result += convertLessThanThousand(rupees);
    }
    
    result = result.trim();
    
    if (result === '') {
        result = 'Zero';
    }
    
    result += ' Rupees';
    
    // Add paise if any
    if (paise > 0) {
        result += ' and ' + convertLessThanThousand(paise) + ' Paise';
    }
    
    result += ' Only';
    
    return result;
};

module.exports = amountToWords;