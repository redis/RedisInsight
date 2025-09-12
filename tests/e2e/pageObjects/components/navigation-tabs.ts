import { Selector } from 'testcafe';

export class NavigationTabs {
    browserButton = Selector('[role=tablist] p').withExactText('Browse').parent('[type=button]');
    workbenchButton = Selector('[role=tablist] p').withExactText('Workbench').parent('[type=button]');
    analysisButton = Selector('[role=tablist] p').withExactText('Analyze').parent('[type=button]');
    pubSubButton = Selector('[role=tablist] p').withExactText('Pub/Sub').parent('[type=button]');
}
