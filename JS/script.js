const boneco = document.querySelector('#boneco')
const obstaculo = document.querySelector('#obstaculo1')
const cenario = document.querySelector('#cenario')
const pontos = document.querySelector('#pontos')
const mensagem = document.querySelector('#mensagem')
const botaoPause = document.querySelector('#pause')
const botaoReiniciar = document.querySelector('#reiniciar')

let posicao = 20
let pontuacao = 0
let pausado = false
let perdeu = false
let tempoDecorrido = 0
let ultimoQuadro = null
let quadroAtual = null

document.addEventListener('keydown', controlar)
boneco.addEventListener('animationend', parar)
botaoPause.addEventListener('click', alternarPausa)
botaoReiniciar.addEventListener('click', reiniciar)

function controlar(evento) {
    const tecla = evento.key.toLowerCase()

    if (['arrowup', 'arrowleft', 'arrowright', ' ', 'p', 'r'].includes(tecla)) {
        evento.preventDefault()
    }

    if (tecla === 'r') {
        reiniciar()
        return
    }

    if (tecla === 'p') {
        alternarPausa()
        return
    }

    if (perdeu || pausado) return

    if ((tecla === 'arrowup' || tecla === ' ') &&
        !boneco.classList.contains('pulando')) {
        boneco.classList.add('pulando')
    }

    const limite = cenario.clientWidth - boneco.offsetWidth

    if (tecla === 'arrowleft') {
        posicao = Math.max(0, posicao - 10)
    } else if (tecla === 'arrowright') {
        posicao = Math.min(limite, posicao + 10)
    }

    boneco.style.left = `${posicao}px`
}

function parar() {
    boneco.classList.remove('pulando')
}

function atualizarPontuacao() {
    pontos.textContent = String(pontuacao).padStart(5, '0')
}

function atualizarJogo(tempo) {
    if (pausado || perdeu) return

    if (ultimoQuadro !== null) {
        tempoDecorrido += tempo - ultimoQuadro
        const novaPontuacao = Math.floor(tempoDecorrido / 100)

        if (novaPontuacao !== pontuacao) {
            pontuacao = novaPontuacao
            atualizarPontuacao()
            atualizarVelocidade()
        }
    }

    ultimoQuadro = tempo
    verificarColisao()

    if (!perdeu) {
        quadroAtual = requestAnimationFrame(atualizarJogo)
    }
}

function verificarColisao() {
    const personagem = boneco.getBoundingClientRect()
    const perigo = obstaculo.getBoundingClientRect()

    const margemPersonagemX = personagem.width * 0.3
    const margemObstaculoX = perigo.width * 0.3
    const margemPersonagemTopo = personagem.height * 0.2
    const margemObstaculoTopo = perigo.height * 0.25

    const colidiu =
        personagem.right - margemPersonagemX > perigo.left + margemObstaculoX &&
        personagem.left + margemPersonagemX < perigo.right - margemObstaculoX &&
        personagem.bottom - 8 > perigo.top + margemObstaculoTopo &&
        personagem.top + margemPersonagemTopo < perigo.bottom - 8

    if (colidiu) {
        perdeu = true
        cenario.classList.add('pausado')
        mensagem.textContent = `Se fudeu! Pontuação: ${String(pontuacao).padStart(5, '0')}`
        botaoPause.disabled = true
        cancelAnimationFrame(quadroAtual)
    }
}

function atualizarVelocidade() {
    const velocidade = Math.min(1 + tempoDecorrido / 120000, 2.5)
    const animacaoObstaculo = obstaculo.getAnimations().find(
        animacao => animacao.animationName === 'mover'
    )

    if (animacaoObstaculo) {
        animacaoObstaculo.playbackRate = velocidade
    }
}

function alternarPausa() {
    if (perdeu) return

    pausado = !pausado
    cenario.classList.toggle('pausado', pausado)
    botaoPause.textContent = pausado ? 'Continuar' : 'Pausar'

    if (pausado) {
        ultimoQuadro = null
        cancelAnimationFrame(quadroAtual)
    } else {
        mensagem.textContent = ''
        quadroAtual = requestAnimationFrame(atualizarJogo)
    }
}

function reiniciar() {
    pontuacao = 0
    posicao = 20
    pausado = false
    perdeu = false
    tempoDecorrido = 0
    ultimoQuadro = null
    atualizarVelocidade()

    atualizarPontuacao()
    mensagem.textContent = ''
    boneco.style.left = `${posicao}px`
    boneco.classList.remove('pulando')
    cenario.classList.remove('pausado')
    botaoPause.disabled = false
    botaoPause.textContent = 'Pausar'

    obstaculo.style.animation = 'none'
    void obstaculo.offsetWidth
    obstaculo.style.animation = ''

    cancelAnimationFrame(quadroAtual)
    quadroAtual = requestAnimationFrame(atualizarJogo)
}

atualizarPontuacao()
quadroAtual = requestAnimationFrame(atualizarJogo)
