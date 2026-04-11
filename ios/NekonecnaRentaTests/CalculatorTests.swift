import XCTest
@testable import NekonecnaRenta

final class CalculatorTests: XCTestCase {

    // Test 1: Standard case (30→60, 6%, 5000 Kč, 20 years)
    func testStandardCase() {
        let inputs = CalculationInputs(
            currentAge: 30,
            retirementAge: 60,
            rentaYears: 20,
            monthlyInvestment: 5000,
            annualReturnRate: 6
        )
        let result = Calculator.calculate(inputs)

        XCTAssertGreaterThan(result.futureValue, 0, "FV musí být kladné")
        XCTAssertGreaterThan(result.monthlyRenta, 0, "Měsíční renta musí být kladná")
        XCTAssertGreaterThan(result.infiniteRenta, 0, "Nekonečná renta musí být kladná")
        XCTAssertGreaterThan(result.monthlyRenta, result.infiniteRenta, "Renta na čas musí být větší než nekonečná renta")

        // Chart data retirement point ≈ fv (±1)
        let retirementPoint = result.chartData.first(where: { $0.age == 60 })
        XCTAssertNotNil(retirementPoint, "Musí existovat bod pro věk důchodu")
        if let rp = retirementPoint {
            XCTAssertLessThanOrEqual(abs(rp.capital - result.futureValue), 1,
                "Hodnota portfolia v důchodu musí odpovídat FV ±1 Kč, got \(rp.capital) vs \(result.futureValue)")
        }
    }

    // Test 2: i=0 (0% annual return)
    func testZeroInterestRate() {
        let inputs = CalculationInputs(
            currentAge: 30,
            retirementAge: 55,
            rentaYears: 15,
            monthlyInvestment: 3000,
            annualReturnRate: 0
        )
        let result = Calculator.calculate(inputs)

        // nSpor = (55-30)*12 = 300 months
        // fv = 3000 * 300 = 900_000
        let expectedFV = 3000 * 300
        XCTAssertEqual(result.futureValue, expectedFV, "FV při i=0 musí být PMT * nSpor = \(expectedFV)")

        // nRenta = 15*12 = 180
        // R = floor(900000/180) = 5000
        let expectedR = 900_000 / 180
        XCTAssertEqual(result.monthlyRenta, expectedR, "Renta při i=0 musí být fv/nRenta = \(expectedR)")

        // R_inf = floor(fv * 0) = 0
        XCTAssertEqual(result.infiniteRenta, 0, "Nekonečná renta při i=0 musí být 0")
    }

    // Test 3: Short savings period (50→51), 1 year
    func testShortSavingsPeriod() {
        let inputs = CalculationInputs(
            currentAge: 50,
            retirementAge: 51,
            rentaYears: 5,
            monthlyInvestment: 10000,
            annualReturnRate: 6
        )
        let result = Calculator.calculate(inputs)

        XCTAssertGreaterThan(result.futureValue, 0, "FV musí být kladné i pro krátké spoření")
        XCTAssertGreaterThan(result.monthlyRenta, 0, "Měsíční renta musí být kladná")
        XCTAssertGreaterThan(result.chartData.count, 0, "Chart data musí mít alespoň jeden bod")
    }

    // Test 4: Chart data retirement point tolerance ≤ 1 (25→55, 7%, 8000)
    func testChartRetirementPointTolerance() {
        let inputs = CalculationInputs(
            currentAge: 25,
            retirementAge: 55,
            rentaYears: 20,
            monthlyInvestment: 8000,
            annualReturnRate: 7
        )
        let result = Calculator.calculate(inputs)

        let retirementPoint = result.chartData.first(where: { $0.age == 55 })
        XCTAssertNotNil(retirementPoint, "Musí existovat bod pro věk důchodu 55")
        if let rp = retirementPoint {
            let diff = abs(rp.capital - result.futureValue)
            XCTAssertLessThanOrEqual(diff, 1,
                "Odchylka hodnoty v důchodu od FV musí být ≤1 Kč, ale je \(diff) Kč (chartCapital=\(rp.capital), FV=\(result.futureValue))")
        }
    }

    // Test 5: Higher return yields higher FV (10% vs 6%)
    func testHigherReturnYieldsHigherFV() {
        let inputs6 = CalculationInputs(
            currentAge: 30,
            retirementAge: 60,
            rentaYears: 20,
            monthlyInvestment: 5000,
            annualReturnRate: 6
        )
        let inputs10 = CalculationInputs(
            currentAge: 30,
            retirementAge: 60,
            rentaYears: 20,
            monthlyInvestment: 5000,
            annualReturnRate: 10
        )
        let result6 = Calculator.calculate(inputs6)
        let result10 = Calculator.calculate(inputs10)

        XCTAssertGreaterThan(result10.futureValue, result6.futureValue,
            "FV při 10% musí být větší než při 6% (\(result10.futureValue) vs \(result6.futureValue))")
    }
}
