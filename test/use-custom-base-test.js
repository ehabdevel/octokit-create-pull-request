const { test } = require("tap");

const Octokit = require("@octokit/rest").plugin(require(".."));

test("use custom base", async t => {
  const fixtures = require("./fixtures/custom-base");
  const fixturePr = fixtures[fixtures.length - 1].response;
  const octokit = new Octokit();

  octokit.hook.wrap("request", (_, options) => {
    const currentFixtures = fixtures.shift();
    const {
      baseUrl,
      method,
      url,
      request,
      headers,
      mediaType,
      ...params
    } = options;

    t.equal(currentFixtures.request.method, options.method);
    t.equal(currentFixtures.request.url, options.url);

    Object.keys(params).forEach(paramName => {
      t.deepEqual(currentFixtures.request[paramName], params[paramName]);
    });
    return currentFixtures.response;
  });

  const pr = await octokit.createPullRequest({
    owner: "gr2m",
    repo: "pull-request-test",
    title: "One comes, one goes",
    body: "because",
    head: "test-branch-1rtg5",
    base: "other-branch",
    changes: {
      files: {
        "path/to/file1.txt": "Content for file1",
        "path/to/file2.txt": "Content for file2"
      },
      commit: "why"
    }
  });

  t.deepEqual(pr, fixturePr);
  t.equal(fixtures.length, 0);
});
