import React from 'react';
import Sound from 'react-sound';
import axios from 'axios';

const TextToSpeech = (props) => {
    axios.post('/quizQuestion', { question: props.question })

    return (
        <div>
            <Sound
                url='/output'
                playStatus={ Sound.status.PLAYING }
            />
        </div>
    )
}

export default TextToSpeech;