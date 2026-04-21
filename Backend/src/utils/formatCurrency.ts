// convert rupee to paise when saving to database 

function convertRupeeToPaise(rupee: number): string {
    const paise  = Math.round(rupee * 100);
    return paise.toString()
}

// convert paise to rupee when sending response to client

function convertPaiseToRupee(paise: number): number {
    return paise / 100;
}

export {
    convertRupeeToPaise,
    convertPaiseToRupee
}