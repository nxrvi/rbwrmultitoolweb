document.addEventListener("DOMContentLoaded", function () {
    const aprmInput = document.getElementById("aprm");
    const demandInput = document.getElementById("demand");
    const feedwaterInput = document.getElementById("feedwater");
    const genLoadInput = document.getElementById("gen-load");
    const siteUsage = document.getElementById("site-usage");
    const unit1_toggle = document.getElementById("unit1-toggle");
    const unit2_toggle = document.getElementById("unit2-toggle");

    const systemsToggle = document.getElementById('systems-toggle');
    const systemsContent = document.getElementById('systems-content');

    let selected_Unit = 1;
    let suppressTB_Demand = false;
    let suppressTB_APRM = false;

    const CalcType = {
        demandToThermal: 'demandToThermal',
        thermalToMW: 'thermalToMW'
    };

    let usage = 61.32;

    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarlinks = document.querySelector('.navbar-links');
    const navbar = document.querySelector('.navbar');

    if (navbarToggle && navbar && navbarlinks) {
        navbarToggle.addEventListener('click', function () {
        navbarlinks.classList.toggle('show');
        navbar.classList.toggle('show');
    });
    } else {
        console.error("Navbar toggle or navbar elements not found!");
    }


    if (systemsToggle && systemsContent) {
        systemsToggle.addEventListener('click', function() {
            systemsContent.classList.toggle('show');
            const arrow = systemsToggle.querySelector('.dropdown-arrow');
            arrow.textContent = systemsContent.classList.contains('show') ? '▲' : '▼';
        });
    }

    if (unit1_toggle && unit2_toggle) {
        unit1_toggle.addEventListener('click', function() {
            selected_Unit = 1;
            unit1_toggle.checked = true;
            unit2_toggle.checked = false;
            document.getElementById('unit-choosen').textContent = selected_Unit;
        });

        unit2_toggle.addEventListener('click', function() {
            selected_Unit = 2;
            unit2_toggle.checked = true;
            unit1_toggle.checked = false;
            document.getElementById('unit-choosen').textContent = selected_Unit;
        });
    }


    class Calculator {
        constructor(usage) {
            this.usage = usage;
        }

        setUsage(value) {
            this.usage = isNaN(value) || value < 0 ? 61.32 : value;
        }

        calc(type, value){
            let result;
            if (type === CalcType.thermalToMW) {
                result = this.thermalToMW(value);
            }
            else if (type === CalcType.demandToThermal) {
                result = this.demandToThermal(value);
            }
            return result;
        }

        thermalToMW(thermal) {
            let gen_load = this.CalcGenLoad(thermal);
            return gen_load.toFixed(0);
        }

        demandToThermal(demand) {
            let thermal = this.CalcThermal(demand);
            return thermal.toFixed(0);
        }

        calcFlow(thermal){
            if (selected_Unit === 1) {
                return Math.max(0,
                    (82.8 + (13.7 * thermal) + (5.87 * Math.pow(10, -3) * Math.pow(thermal, 2))));
            } else if (selected_Unit === 2) {
                return Math.max(0,
                    (115 + (12.2 * thermal) + (9.27 * Math.pow(10, -3) * Math.pow(thermal, 2))));
            }
        }

        CalcGenLoad(thermal) {
            if (selected_Unit === 1) {
                return Math.max(0,
                    (-135 + (13 * thermal) + (5.33 * Math.pow(10, -3) * Math.pow(thermal, 2))));
            } else if (selected_Unit === 2) {
                return Math.max(
                    0,
                    (-143 + (12.5 * thermal) - (2.06 * Math.pow(10, -3) * Math.pow(thermal, 2))));
            }
        }

        CalcThermal(demand) {
            if (selected_Unit === 1) {
                return Math.max(0, ((-13 + Math.sqrt(169 + 0.02132 * (demand + 135 + this.usage))) / 0.01066));
            } else if (selected_Unit === 2) {
                return Math.max(0,
                    ((12.5 + Math.sqrt(156.25 - 0.00824 * (mw + 143))) / 0.00412));
            }
        }

        getUsage() {
            return this.usage;
        }
    }

    const calculator = new Calculator(usage);


    siteUsage.addEventListener("input", function() {
        let x = siteUsage.value;
        x = parseFloat(x);
        calculator.setUsage(x);
    });

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

        let y = calculator.calc(CalcType.demandToThermal, a)
        y = parseFloat(y);
        aprmInput.value = y;

        if (y > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else if (invalid !== 2 && invalid !== 1) {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = Math.round(calculator.calcFlow(y) + 2); // +2 cause of mathematical rounding errors causing offset by 1 to 3
        genLoadInput.value = Math.round(calculator.CalcGenLoad(y));

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

        y = calculator.calc(CalcType.thermalToMW, a);
        y = parseFloat(y);

        genLoadInput.value = y;

        if (a > 108) {
            lbError.classList.add('visible');
            lbError.textContent = 'It is generally not recommended to exceed 108% APRM';
            aprmInput.style.backgroundColor = 'red';
        } else if (invalid !== 2 && invalid !== 1) {
            aprmInput.style.backgroundColor = 'rgb(75, 75, 75)';
            lbError.classList.remove('visible');
        }

        feedwaterInput.value = Math.round(calculator.calcFlow(a) + 2); // +2 cause of mathematical rounding errors causing offset by 1 to 3
        demandInput.value = Math.round(y - calculator.getUsage());

        suppressTB_Demand = false;
    });
});
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
