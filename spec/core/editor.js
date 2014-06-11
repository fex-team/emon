/**
 * Created by dongyancen on 14-6-11.
 */
describe("editor", function () {
//toBe   相当于===，处理简单字面值和变量
    it("editor", function () {
        if(ua.browser.chrome){
           expect(1).toBe(1);
        }
        expect(Emon.EmonEditor).toBeDefined();
    });
});