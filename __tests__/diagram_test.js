// https://facebook.github.io/jest/docs/manual-mocks.html#content
// TODO mock data ^

const diagram = require('../diagram');
const $ = require('jquery');

describe('diagram', () => {
  it('inputs a valid user to output d3 svg nodes', () => {
    const testUser = 'valmassoi'
    diagram.changeUsername(testUser)
    //TODO mock document body
    expect($('#playground svg g').length)//count number of nodes
      .toBeGreaterThan(0)
  });

  it('inputs an invalid user to output an error message', () => {
    const testUser = 'asdkfldllsaasdfadsl'
    //TODO async https://facebook.github.io/jest/docs/tutorial-async.html#content
    expect(diagram.changeUsername(testUser)).toBe("error");
  });
})
