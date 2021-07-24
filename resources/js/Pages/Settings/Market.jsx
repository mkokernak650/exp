import Layout from '../Layout/Layout'
import { Inertia } from '@inertiajs/inertia'

const Market = () => {

    const importHendler = (e) => {
        e.preventDefault()

        const form = new FormData(e.target)

        // console.log(form.entries)

        // post(route('zipcode.television.market'), form)
        Inertia.post(route('market.import'), form)
    }

    return (
        <div>

            <form method='post' encType='multipart/form-data' onSubmit={importHendler}>
                <input id='importfile' type="file" name='importfile' />
                <button type='submit'>Import</button>
            </form>

            <a href={route('market.export', 'csv')}> Export </a>

        </div>
    )
}

Market.layout = page => <Layout title="Market">{page}</Layout>
export default Market
