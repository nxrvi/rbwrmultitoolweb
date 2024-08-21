document.addEventListener("DOMContentLoaded", function () {
    const aprmInput = document.getElementById("aprm");
    const demandInput = document.getElementById("demand");
    const feedwaterInput = document.getElementById("feedwater");
    const genLoadInput = document.getElementById("gen-load");

    let suppressTB_Demand = false;
    let suppressTB_APRM = false;

    const CalcType = {
        MWtoAPRM: 'MWtoAPRM',
        APRMtoMW: 'APRMtoMW'
    };

    demandInput.addEventListener('input', function () {
        if (suppressTB_Demand) return;

        suppressTB_APRM = true;

        let a;
        let invalid = 0;

        try {
            a = parseFloat(demandInput.value);
            if (isNaN(a) || a < 0) {
                invalid = 2;
                a = 0;
            }
        } catch (ex) {
            invalid = 1;
            a = 0;
        }

        const lbError = document.getElementById('error');

        if (invalid === 2) {
            demandInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be greater than 0!';
        } else if (invalid === 1) {
            demandInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be numbers!';
        } else {
            demandInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        const y = Calc(a, CalcType.MWtoAPRM);
        aprmInput.value = y;

        if (y > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = CalcFlow(y);
        genLoadInput.value = CalcGenLoad(y);

        suppressTB_APRM = false;
    });

    aprmInput.addEventListener('input', function () {
        if (suppressTB_APRM) return;

        suppressTB_Demand = true;

        let a;
        let invalid = 0;
        let y;

        try {
            a = parseFloat(aprmInput.value);
            if (isNaN(a) || a < 0) {
                invalid = 2;
                a = 0;
            }
        } catch (ex) {
            invalid = 1;
            a = 0;
        }

        const lbError = document.getElementById('error');

        if (invalid === 2) {
            aprmInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be greater than 0!';
        } else if (invalid === 1) {
            aprmInput.style.backgroundColor = 'red';
            lbError.classList.add('visible');
            lbError.textContent = 'The values in the fields must be numbers!';
        } else {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        y = Calc(a, CalcType.APRMtoMW);

        if (y < 0) {
            y = 0;
        }

        demandInput.value = y;

        if (a > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = CalcFlow(a);
        genLoadInput.value = CalcGenLoad(a);

        suppressTB_Demand = false;
    });

    function Calc(a, calctype) {
        let y;
        if (calctype === CalcType.APRMtoMW) {
            y = CalcGenLoad(a) - ((1.299 * a) - 13);
            return Math.round(y);
        } else if (calctype === CalcType.MWtoAPRM) {
            y = CalcAprm(a);
            return parseFloat(y.toFixed(2));
        }
    }

    function CalcFlow(therm) {
        let flow;

        flow = 82.8 + (13.7 * therm) + (5.87 * Math.pow(10, -3) * Math.pow(therm, 2));

        return Math.round(flow) + 2;
    }

    function CalcGenLoad(therm) {
        let mw;

        mw = -135 + (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));

        return Math.round(mw);
    }

    function CalcAprm(mw) {
        let therm;

        /*
        mw = -135 + (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw + 135 = (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw + 135 - (13 * therm) = 5.33 * Math.pow(10, -3) * Math.pow(therm, 2);
        mw + 135 - (13 * therm) / 5.33 * Math.pow(10, -3) = Math.pow(therm, 2);
        mw + 135 - 13 * -therm / 5.33 * Math.pow(10, -3) = math.pow(therm, 2);
        mw + 135 - 13 = math.pow(therm, 2) / -therm / 5.33 * Math.pow(10, -3);
        mw + 135 - 13 * (5.33 * Math.pow(10, -3)) = math.pow(therm, 2) / -therm;

        therm = Math.sqrt((mw + 135 - 13) / -therm / 5.33 * Math.pow(10, -3));

        mw = -135 + (13 * therm) + (5.33 * Math.pow(10, -3) * Math.pow(therm, 2));
        mw = -135 + (13 * therm) + 5.33 * Math.pow(10, -3) * Math.pow(therm, 2);
        mw / Math.pow(therm, 2) = -135 + 13 * therm + 5.33 * Math.pow(10, -3);
        mw / Math.pow(therm, 2) / therm = -135 + 13 + 5.33 * Math.pow(10, -3);
        Math.pow(therm, 2) / therm = (-135 + 13 + 5.33 * Math.pow(10, -3)) * mw;

        therm = (-135 + 13 + 5.33 * Math.pow(10, -3)) * mw;

        mw = 14.3 * therm - 163 - 42.7
        mw + 42.7 = 14.3 * therm - 163
        mw + 42.7 + 163 = 14.3 * therm
        (mw + 42.7 + 163) / 14.3 = therm
        */
        /* 61.32 represents the avg. site usage. if i manage to get a accurate reading regarding that,
        i might be able to make the conversion more accurate*/
        therm = (mw + 61.32 + 163) / 14.3;


        return parseFloat(therm.toFixed(2));
    }
});
