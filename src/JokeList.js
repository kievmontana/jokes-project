import React, {Component} from 'react';
import axios from 'axios';
import uuid from 'uuid/v4'
import Joke from './Joke';
import './JokeList.css';

const API_URL = 'https://icanhazdadjoke.com/';

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };

    constructor(props) {
        super(props);

        this.state = {
            jokes: JSON.parse(localStorage.getItem("jokes") || "[]"),
            loading: false
            };
        // push to a set jokes in order to prevent duplication
        this.seenJokes = new Set(this.state.jokes.map(j => j.text)); // get the set of unique content
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();
    }

    async getJokes() {

        try{
            let jokes = [];

            while(jokes.length < this.props.numJokesToGet) {
                let res = await axios.get(API_URL, {
                    headers: {Accept: 'application/json'}
                });

                let newJoke = res.data.joke;

                if(!this.seenJokes.has(newJoke)) {
                    jokes.push( {id: uuid(), text: newJoke , votes: 0} );
                } else {
                    console.log('FOUND DUPLICATE');
                    console.log(newJoke);
                }

            }

            this.setState(st => ({
                    loading: false,
                    jokes: [...st.jokes, ...jokes] // we're adding new jokes to existing jokes
                }),// update localStorage once the state is updated
                ()=> localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));

            localStorage.setItem("jokes",
                JSON.stringify(jokes));

        } catch(err) {
            alert(err);
            this.setState({loading: false});
        }

    }

    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j =>
            j.id === id ? {...j, votes: j.votes + delta } : j)
        }), // update localStorage once the state is updated
            ()=> localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    }

    // handleClick() {
    //     this.setState({loading: true});
    //     this.getJokes();
    // }

    // Above func is working
    // But below we make sure that getJokes() fires after State update
    handleClick() {
        this.setState({loading: true}, this.getJokes);
    }

    render() {

        if(this.state.loading) {
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h2 className="JokeList-title">Loading...</h2>
                </div>
            )
        }
        // sort jokes by votes
        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);

        return(
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt=""/>
                    <button className="JokeList-getmore" onClick={this.handleClick}>Fetch Jokes</button>
                </div>
                <div className="JokeList-jokes">

                    {jokes.map(j => (
                        <Joke
                            key={j.id}
                            text={j.text}
                            votes={j.votes}
                            upvote={()=> this.handleVote(j.id, 1)}
                            downvote={()=> this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        )
    }

}

export default JokeList;
