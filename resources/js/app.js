import { InertiaApp } from '@inertiajs/inertia-react';
// import { InertiaProgress } from '@inertiajs/progress';
import { render } from 'react-dom';


if (window?.Ziggy?.baseProtocol === 'http') {
  window.Ziggy.baseProtocol = 'https'
}
// InertiaProgress.init({
//   color: '#ED8936',
//   showSpinner: true,
// });

const app = document.getElementById('app');

render(
    <InertiaApp
      initialPage={JSON.parse(app.dataset.page)}
      resolveComponent={name => import(`./Pages/${name}`).then(module => module.default)}
    />,
  app,
);